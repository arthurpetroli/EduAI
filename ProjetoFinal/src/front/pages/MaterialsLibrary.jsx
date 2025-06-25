import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  SimpleGrid,
  VStack,
  HStack,
  Divider,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Select,
  Icon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast,
  Spinner,
  Center
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaEllipsisV, 
  FaFileAlt, 
  FaClipboardList,
  FaChartBar,
  FaDownload,
  FaShare,
  FaEdit,
  FaTrash,
  FaEye,
  FaPlus 
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';

const MaterialsLibrary = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    discipline: 'all',
    gradeLevel: 'all'
  });
  const [sortOption, setSortOption] = useState('recent');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Adicione um novo estado para controlar quando os filtros foram alterados
  const [filterChanged, setFilterChanged] = useState(false);

  // Carregar materiais ao montar o componente
  useEffect(() => {
    fetchMaterials();
  }, []);

  // Função para buscar materiais
  const fetchMaterials = async () => {
    setIsLoading(true);
    try {
      // Buscar textos de apoio - trocar de /textos-apoio para /materiais
      const textosResponse = await api.get('/materiais');
      
      // Buscar listas de exercícios
      const listasResponse = await api.get('/listas-exercicios');
      
      // Buscar avaliações
      const avaliacoesResponse = await api.get('/avaliacoes');
      
      // Mapear os diferentes tipos de materiais
      const textos = textosResponse.data.map(item => ({
        id: item.id,
        title: item.tema,
        type: 'material',
        discipline: item.materia || 'Não especificado',
        gradeLevel: item.nivel || 'Não especificado',
        updatedAt: item.updated_at || item.created_at,
        description: item.conteudo ? item.conteudo.substring(0, 100) + '...' : ''
      }));
      
      const listas = listasResponse.data.map(item => ({
        id: item.id,
        title: item.titulo || `Lista #${item.id}`,
        type: 'exercise',
        discipline: item.materia || 'Não especificado',
        gradeLevel: item.nivel_dificuldade || 'Não especificado',
        updatedAt: item.updated_at || item.created_at,
        description: `Lista com ${item.exercicios?.length || 0} exercícios`
      }));
      
      const avaliacoes = avaliacoesResponse.data.map(item => ({
        id: item.id,
        title: item.titulo || `Avaliação #${item.id}`,
        type: 'assessment',
        discipline: item.materia || 'Não especificado',
        gradeLevel: item.nivel_dificuldade || 'Não especificado',
        updatedAt: item.updated_at || item.created_at,
        description: `Avaliação com ${item.exercicios?.length || 0} questões`
      }));
      
      // Combinar todos os materiais
      setMaterials([...textos, ...listas, ...avaliacoes]);
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar seus materiais',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para pesquisar e filtrar materiais
  const getFilteredMaterials = () => {
    // Se não houver termo de busca, aplicar apenas os outros filtros
    if (!searchTerm || searchTerm.trim() === '') {
      return materials.filter(material => {
        const typeMatch = selectedFilters.type === 'all' || material.type === selectedFilters.type;
        const disciplineMatch = selectedFilters.discipline === 'all' || 
          material.discipline === selectedFilters.discipline;
        const gradeLevelMatch = selectedFilters.gradeLevel === 'all' || 
          material.gradeLevel === selectedFilters.gradeLevel;
        
        return typeMatch && disciplineMatch && gradeLevelMatch;
      }).sort(sortMaterials);
    }
    
    // Se houver termo de busca, aplicar busca mais abrangente
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    return materials.filter(material => {
      // Busca em vários campos
      const titleMatch = material.title && material.title.toLowerCase().includes(searchTermLower);
      const disciplineMatch = material.discipline && material.discipline.toLowerCase().includes(searchTermLower);
      const descriptionMatch = material.description && material.description.toLowerCase().includes(searchTermLower);
      const contentMatch = material.content && material.content.toLowerCase().includes(searchTermLower);
      
      // Considerar qualquer correspondência como resultado positivo
      const searchMatch = titleMatch || disciplineMatch || descriptionMatch || contentMatch;
      
      // Aplicar os outros filtros
      const typeMatch = selectedFilters.type === 'all' || material.type === selectedFilters.type;
      const disciplineFilterMatch = selectedFilters.discipline === 'all' || 
        material.discipline === selectedFilters.discipline;
      const gradeLevelMatch = selectedFilters.gradeLevel === 'all' || 
        material.gradeLevel === selectedFilters.gradeLevel;
      
      return searchMatch && typeMatch && disciplineFilterMatch && gradeLevelMatch;
    }).sort(sortMaterials);
  };

  // Função auxiliar para ordenação
  const sortMaterials = (a, b) => {
    if (sortOption === 'recent') {
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    } else if (sortOption === 'oldest') {
      return new Date(a.updatedAt || a.createdAt || 0) - new Date(b.updatedAt || b.createdAt || 0);
    } else if (sortOption === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  };

  const handleViewDetail = async (material) => {
    try {
      setIsLoading(true);
      
      if (material.type === 'material') {
        // Buscar material didático
        const response = await api.get(`/materiais/${material.id}`);
        setSelectedMaterial({
          ...material,
          content: response.data.conteudo
        });
      } 
      else if (material.type === 'exercise' || material.type === 'assessment') {
        // Buscar lista de exercícios/avaliação
        const response = await api.get(`/listas-exercicios/${material.id}`);
        setSelectedMaterial({
          ...material,
          exercicios: response.data.exercicios || [],
          cabecalho: response.data.cabecalho || '',
          instrucoes: response.data.instrucoes || ''
        });
      }
      
      onOpen();
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes do material',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (id, format) => {
    try {
      const material = materials.find(m => m.id === id);
      if (!material) {
        throw new Error("Material não encontrado");
      }
      
      let endpoint;
      if (material.type === 'material') {
        endpoint = `/textos-apoio/${id}/exportar/${format}`;
      } else if (material.type === 'exercise' || material.type === 'assessment') {
        endpoint = `/listas-exercicios/${id}/exportar/${format}`;
      }
      
      const response = await api.get(endpoint, {
        responseType: 'blob'
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${material.title}.${format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download concluído',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exportar o material',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const material = materials.find(m => m.id === id);
      if (!material) return;
      
      // Atualizar UI primeiro
      setMaterials(materials.filter(m => m.id !== id));
      
      // Determinar o endpoint
      let endpoint;
      if (material.type === 'material') {
        endpoint = `/materiais/${id}`;
      } else if (material.type === 'exercise' || material.type === 'assessment') {
        endpoint = `/listas-exercicios/${id}`;
      }
      
      await api.delete(endpoint);
      
      toast({
        title: 'Material excluído',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      // Recarregar os materiais em caso de erro
      fetchMaterials();
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o material',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Função auxiliar para obter o rótulo do tipo
  const getTypeLabel = (type) => {
    switch (type) {
      case 'material': return 'Material Didático';
      case 'exercise': return 'Lista de Exercícios';
      case 'assessment': return 'Avaliação';
      default: return 'Outro';
    }
  };

  // Função auxiliar para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Função para obter o ícone do tipo
  const getTypeIcon = (type) => {
    switch (type) {
      case 'material': return { icon: FaFileAlt, color: 'blue.500' };
      case 'exercise': return { icon: FaClipboardList, color: 'green.500' };
      case 'assessment': return { icon: FaChartBar, color: 'purple.500' };
      default: return { icon: FaFileAlt, color: 'gray.500' };
    }
  };

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? <mark key={i}>{part}</mark> : part
        )}
      </>
    );
  };

  // Modifique a função onde você altera o estado dos filtros
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev, [filterType]: value };
      // Force o re-render explicitamente
      setFilterChanged(!filterChanged);
      return newFilters;
    });
  };

  // Adicione um useEffect para reagir às mudanças de filtro
  useEffect(() => {
    // Este efeito será executado toda vez que os filtros forem alterados
    // Não é necessário fazer nada aqui, apenas forçar uma re-renderização
  }, [selectedFilters, filterChanged]);

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={2}>Biblioteca de Materiais</Heading>
      <Text color="gray.600" mb={8}>
        Todos os seus materiais didáticos, exercícios e avaliações
      </Text>
      
      <Box mb={8}>
        <Heading as="h2" size="md" color="brand.600" mb={2}>
          Todos os Materiais
        </Heading>
        <Divider />
      </Box>

      {/* Dashboard stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} mb={6}>
        <Card>
          <CardBody>
            <Flex align="center">
              <Box bg="blue.100" p={3} borderRadius="md" mr={4}>
                <Icon as={FaFileAlt} color="blue.500" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Materiais Didáticos</Text>
                <Text fontSize="2xl" fontWeight="bold">{materials.filter(item => item.type === 'material').length}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex align="center">
              <Box bg="green.100" p={3} borderRadius="md" mr={4}>
                <Icon as={FaClipboardList} color="green.500" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Exercícios</Text>
                <Text fontSize="2xl" fontWeight="bold">{materials.filter(item => item.type === 'exercise').length}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex align="center">
              <Box bg="purple.100" p={3} borderRadius="md" mr={4}>
                <Icon as={FaChartBar} color="purple.500" boxSize={5} />
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600">Avaliações</Text>
                <Text fontSize="2xl" fontWeight="bold">{materials.filter(item => item.type === 'assessment').length}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex align="center" justify="space-between">
              <Box flex={1}>
                <Text fontSize="sm" color="gray.600">Total</Text>
                <Text fontSize="2xl" fontWeight="bold">{materials.length}</Text>
              </Box>
              <Button 
                as={RouterLink}
                to="/dashboard"
                colorScheme="brand" 
                size="sm"
                leftIcon={<Icon as={FaPlus} />}
              >
                Criar Novo
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Busca e filtros */}
      <Box bg="white" p={4} borderRadius="lg" boxShadow="md" mb={6}>
        <InputGroup mb={4}>
          <InputLeftElement pointerEvents="none">
            <Icon as={FaSearch} color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder="Buscar materiais, exercícios ou avaliações..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pr="4.5rem"
          />
          {searchTerm && (
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={() => setSearchTerm('')}>
                Limpar
              </Button>
            </InputRightElement>
          )}
        </InputGroup>
        
        <Flex wrap="wrap" gap={4}>
          <Select 
            placeholder="Tipo"
            value={selectedFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            maxW="200px"
          >
            <option value="all">Todos os tipos</option>
            <option value="material">Materiais Didáticos</option>
            <option value="exercise">Exercícios</option>
            <option value="assessment">Avaliações</option>
          </Select>
          
          <Select 
            placeholder="Ordenar por"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            maxW="200px"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigos</option>
          </Select>
        </Flex>
      </Box>

      {/* Status da busca */}
      <Text color="gray.600" mb={4}>
        {getFilteredMaterials().length} {getFilteredMaterials().length === 1 ? 'item' : 'itens'} encontrados
      </Text>

      {/* Loading spinner */}
      {isLoading ? (
        <Center py={10}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      ) : (
        <>
          {/* Lista de materiais */}
          {getFilteredMaterials().length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {getFilteredMaterials().map(material => {
                const typeInfo = getTypeIcon(material.type);
                return (
                  <Card key={material.id} border="1px" borderColor="gray.200" boxShadow="sm">
                    <CardHeader pb={0}>
                      <Flex justify="space-between" align="center">
                        <HStack>
                          <Box bg={`${typeInfo.color.split('.')[0]}.100`} p={2} borderRadius="md">
                            <Icon as={typeInfo.icon} color={typeInfo.color} />
                          </Box>
                          <Badge colorScheme={
                            material.type === 'material' ? 'blue' : 
                            material.type === 'exercise' ? 'green' : 'purple'
                          }>
                            {getTypeLabel(material.type)}
                          </Badge>
                        </HStack>
                      </Flex>
                    </CardHeader>
                    
                    <CardBody>
                      <VStack align="start" spacing={2}>
                        <Heading size="md" onClick={() => handleViewDetail(material)} cursor="pointer">
                          {searchTerm ? highlightMatch(material.title, searchTerm) : material.title}
                        </Heading>
                        
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {material.description}
                        </Text>
                        
                        <HStack>
                          <Badge colorScheme="cyan">{material.discipline}</Badge>
                          <Badge colorScheme="teal">{material.gradeLevel.split(' - ')[0]}</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                    
                    <CardFooter pt={0}>
                      <Flex justify="space-between" align="center" width="100%">
                        <Text fontSize="xs" color="gray.500">
                          Atualizado em {formatDate(material.updatedAt)}
                        </Text>
                        
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            aria-label="Opções"
                            icon={<FaEllipsisV />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem icon={<FaEye />} onClick={() => handleViewDetail(material)}>
                              Visualizar
                            </MenuItem>
                            <MenuItem 
                              icon={<FaEdit />} 
                              as={RouterLink} 
                              to={
                                material.type === 'material' 
                                ? `/generate-material?id=${material.id}`
                                : material.type === 'exercise' 
                                ? `/create-exercises?id=${material.id}`
                                : `/create-assessment?id=${material.id}`
                              }
                            >
                              Editar
                            </MenuItem>
                            <MenuItem icon={<FaDownload />} onClick={() => handleExport(material.id, 'pdf')}>
                              Exportar como PDF
                            </MenuItem>
                            <MenuItem icon={<FaDownload />} onClick={() => handleExport(material.id, 'docx')}>
                              Exportar como DOCX
                            </MenuItem>
                            <MenuItem 
                              icon={<FaTrash />} 
                              color="red.500" 
                              onClick={() => {
                                if (window.confirm('Tem certeza que deseja excluir este material?')) {
                                  handleDelete(material.id);
                                }
                              }}
                            >
                              Excluir
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Flex>
                    </CardFooter>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <Box 
              textAlign="center" 
              p={10} 
              bg="white" 
              borderRadius="lg" 
              boxShadow="md"
            >
              <Icon as={FaSearch} boxSize={10} color="gray.300" mb={4} />
              <Heading size="md" mb={2} color="gray.500">Nenhum material encontrado</Heading>
              <Text mb={6}>
                Não encontramos materiais com os critérios selecionados. Tente mudar os filtros ou criar um novo material.
              </Text>
              <Button 
                as={RouterLink}
                to="/generate-material"
                colorScheme="brand" 
                leftIcon={<Icon as={FaPlus} />}
              >
                Criar Novo Material
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Modal de detalhes */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          {selectedMaterial && (
            <>
              <ModalHeader>
                <HStack>
                  <Text>{selectedMaterial.title}</Text>
                  <Badge colorScheme={
                    selectedMaterial.type === 'material' ? 'blue' : 
                    selectedMaterial.type === 'exercise' ? 'green' : 'purple'
                  }>
                    {getTypeLabel(selectedMaterial.type)}
                  </Badge>
                </HStack>
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                {isLoading ? (
                  <Center py={10}>
                    <Spinner size="xl" color="brand.500" />
                  </Center>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {/* Conteúdo para material didático */}
                    {selectedMaterial.type === 'material' && selectedMaterial.content && (
                      <Box 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        bg="gray.50"
                        maxHeight="50vh"
                        overflowY="auto"
                      >
                        <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
                      </Box>
                    )}
                    
                    {/* Conteúdo para exercícios e avaliações */}
                    {(selectedMaterial.type === 'exercise' || selectedMaterial.type === 'assessment') && (
                      <Box 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md" 
                        bg="gray.50"
                        maxHeight="50vh"
                        overflowY="auto"
                      >
                        {selectedMaterial.cabecalho && (
                          <Box mb={4}>
                            <Heading size="sm" mb={2}>Cabeçalho</Heading>
                            <Text>{selectedMaterial.cabecalho}</Text>
                          </Box>
                        )}
                        
                        {selectedMaterial.instrucoes && (
                          <Box mb={4}>
                            <Heading size="sm" mb={2}>Instruções</Heading>
                            <Text>{selectedMaterial.instrucoes}</Text>
                          </Box>
                        )}
                        
                        <Heading size="sm" mb={4}>
                          {selectedMaterial.type === 'exercise' ? 'Lista de Exercícios' : 'Avaliação'}
                        </Heading>
                        
                        {selectedMaterial.exercicios && selectedMaterial.exercicios.length > 0 ? (
                          selectedMaterial.exercicios.map((exercicio, index) => (
                            <Box 
                              key={index} 
                              p={3} 
                              mb={4} 
                              borderWidth="1px" 
                              borderRadius="md" 
                              bg="white"
                            >
                              <Text fontWeight="bold" mb={2}>
                                {index+1}. {exercicio.enunciado}
                              </Text>
                              
                              {exercicio.opcoes && Object.keys(exercicio.opcoes).length > 0 ? (
                                <Box ml={4} mt={2}>
                                  {Object.entries(exercicio.opcoes).map(([key, value]) => (
                                    <Text key={key} mb={1}>
                                      {key}) {value}
                                      {exercicio.resposta_correta === key && (
                                        <Badge ml={2} colorScheme="green">Correta</Badge>
                                      )}
                                    </Text>
                                  ))}
                                </Box>
                              ) : (
                                <Box ml={4} mt={2}>
                                  <Text fontStyle="italic" color="gray.600">Questão dissertativa</Text>
                                </Box>
                              )}
                              
                              <Text mt={2} color="green.600" fontWeight="medium">
                                Resposta: {exercicio.resposta_correta}
                              </Text>
                            </Box>
                          ))
                        ) : (
                          <Text color="gray.500">Nenhum exercício disponível</Text>
                        )}
                      </Box>
                    )}
                    
                    <Divider />
                    
                    <SimpleGrid columns={2} spacing={4} width="100%">
                      <Box>
                        <Text fontWeight="bold" mb={1}>Disciplina:</Text>
                        <Text>{selectedMaterial.discipline}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="bold" mb={1}>Nível de Ensino:</Text>
                        <Text>{selectedMaterial.gradeLevel}</Text>
                      </Box>
                    </SimpleGrid>
                  </VStack>
                )}
              </ModalBody>
              <ModalFooter>
                <HStack spacing={3}>
                  <Button 
                    leftIcon={<FaDownload />} 
                    onClick={() => handleExport(selectedMaterial.id, 'pdf')}
                    variant="outline"
                  >
                    PDF
                  </Button>
                  <Button 
                    leftIcon={<FaDownload />} 
                    onClick={() => handleExport(selectedMaterial.id, 'docx')}
                    variant="outline"
                  >
                    DOCX
                  </Button>
                </HStack>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default MaterialsLibrary;