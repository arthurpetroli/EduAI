import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  SimpleGrid, 
  Button, 
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Stack,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Spinner,
  Center,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  FaFileAlt, 
  FaClipboardList, 
  FaChartBar, 
  FaPlus,
  FaRegCalendarAlt,
  FaBook,
  FaFileExport,
  FaCogs
} from 'react-icons/fa';
import dashboardService from '../services/dashboardService';
import ReactMarkdown from 'react-markdown';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getDashboardData();
        console.log("Dados recebidos do dashboard:", data); // Log para debug
        setDashboardData(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        
        // Se for erro de autenticação, redirecionamos no serviço
        // Para outros erros, mostramos mensagem de erro
        if (err.response && err.response.status !== 401) {
          setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
          toast({
            title: 'Erro',
            description: 'Falha ao carregar dados do dashboard',
            status: 'error',
            duration: 3000,
            isClosable: true
          });
          
          // Configurar dados fictícios para não quebrar a interface
          setDashboardData({
            materiaisCriados: 0,
            exercicios: 0,
            avaliacoes: 0,
            exportacoes: 0,
            materiaisRecentes: []
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  // Função para abrir o modal com o material selecionado
  const handleViewMaterial = async (material) => {
    try {
      // Se o conteúdo já estiver no dashboardData, use-o diretamente
      if (material.content) {
        setSelectedMaterial(material);
        setIsOpenModal(true);
        return;
      }

      // Caso contrário, busque o material completo
      const materialData = await dashboardService.getMaterialDetails(material.id);
      setSelectedMaterial({
        ...material,
        content: materialData.conteudo
      });
      setIsOpenModal(true);
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o material',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="300px">
          <Spinner size="xl" color="brand.500" />
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center h="300px" flexDirection="column">
          <Heading size="md" color="red.500" mb={4}>Erro ao carregar dashboard</Heading>
          <Text>{error}</Text>
          <Button mt={4} colorScheme="brand" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading mb={2}>Dashboard do Professor</Heading>
          <Text color="gray.600">
            Gerencie seus materiais didáticos e acompanhe suas estatísticas
          </Text>
        </Box>
        <Button 
          as={RouterLink} 
          to="/generate-material" 
          colorScheme="brand" 
          leftIcon={<Icon as={FaPlus} />}
          size="md"
        >
          Novo Material
        </Button>
        <Button 
          colorScheme="blue" 
          size="md"
          onClick={() => {
            setIsLoading(true);
            const fetchDashboardData = async () => {
              try {
                const data = await dashboardService.getDashboardData();
                setDashboardData(data);
              } catch (err) {
                console.error('Erro ao atualizar dashboard:', err);
              } finally {
                setIsLoading(false);
              }
            };
            fetchDashboardData();
          }}
          ml={2}
        >
          Atualizar Dashboard
        </Button>
      </Flex>
      
      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <StatCard 
          icon={FaFileAlt} 
          title="Materiais Criados" 
          value={dashboardData?.materiaisCriados || 0} 
          helpText="Seus materiais didáticos"
        />
        <StatCard 
          icon={FaClipboardList} 
          title="Exercícios" 
          value={dashboardData?.exercicios || 0} 
          helpText="Questões criadas"
        />
        <StatCard 
          icon={FaChartBar} 
          title="Avaliações" 
          value={dashboardData?.avaliacoes || 0} 
          helpText="Avaliações montadas"
        />
        <StatCard 
          icon={FaFileExport} 
          title="Exportações" 
          value={dashboardData?.exportacoes || 0} 
          helpText="Documentos exportados"
        />
      </SimpleGrid>

      {/* Quick Actions */}
      <Box mb={10}>
        <Heading size="md" mb={4}>Ações Rápidas</Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={6}>
          <ActionCard 
            title="Gerar Material" 
            icon={FaFileAlt} 
            description="Crie novos textos e materiais didáticos" 
            link="/generate-material" 
          />
          <ActionCard 
            title="Criar Exercícios" 
            icon={FaClipboardList} 
            description="Desenvolva exercícios personalizados" 
            link="/create-exercises" 
          />
          <ActionCard 
            title="Montar Avaliação" 
            icon={FaChartBar} 
            description="Elabore avaliações adaptativas" 
            link="/create-assessment" 
          />
          <ActionCard 
            title="Acessar Biblioteca" 
            icon={FaBook} 
            description="Veja seus materiais salvos" 
            link="/library" 
          />
        </SimpleGrid>
      </Box>

      {/* Recent Materials */}
      <Box mb={10}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Materiais Recentes</Heading>
          <Button 
            as={RouterLink} 
            to="/library" 
            variant="ghost" 
            colorScheme="brand" 
            size="sm"
          >
            Ver todos
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          {dashboardData?.materiaisRecentes && dashboardData.materiaisRecentes.length > 0 ? (
            dashboardData.materiaisRecentes.map((material, index) => (
              <RecentMaterialCard 
                key={material.id || index}
                title={material.title} 
                type={getTypeLabel(material.type)} 
                date={formatDate(material.date)}
                discipline={material.discipline || "-"}
                id={material.id}
                content={material.content}
              />
            ))
          ) : (
            <Box p={5} borderWidth="1px" borderRadius="lg" textAlign="center" gridColumn={{ md: 'span 3' }}>
              <Text>Você ainda não possui materiais. Comece criando um novo!</Text>
              <Button as={RouterLink} to="/generate-material" mt={4} colorScheme="brand">
                Criar Material
              </Button>
            </Box>
          )}
        </SimpleGrid>
      </Box>

      {/* Modal para visualizar conteúdo */}
      <Modal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} size="xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader>{selectedMaterial?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box 
              p={4} 
              borderWidth="1px" 
              borderRadius="md" 
              bg="white"
              overflowY="auto"
              maxHeight="60vh"
            >
              {selectedMaterial?.content ? (
                <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
              ) : (
                <Text>Carregando conteúdo...</Text>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button 
              mr={3} 
              onClick={() => setIsOpenModal(false)}
              variant="outline"
            >
              Fechar
            </Button>
            <Button 
              colorScheme="brand" 
              as={RouterLink} 
              to={`/generate-material?id=${selectedMaterial?.id}`}
            >
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

// Funções auxiliares
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const getTypeLabel = (type) => {
  const types = {
    'material': 'Material Didático',
    'exercise': 'Lista de Exercícios',
    'assessment': 'Avaliação'
  };
  return types[type] || type;
};

// Componentes auxiliares
const StatCard = ({ icon, title, value, helpText }) => (
  <Stat 
    py={5} 
    px={5}
    bg="white" 
    borderRadius="lg" 
    boxShadow="md"
    position="relative"
    overflow="hidden"
  >
    <Flex direction="column" align="flex-start">
      <Flex align="center" mb={2} width="100%" justify="space-between">
        <StatLabel fontSize="md" fontWeight="medium" color="gray.600">{title}</StatLabel>
        <Box 
          bg="brand.50" 
          p={2} 
          borderRadius="md" 
          color="brand.500"
        >
          <Icon as={icon} boxSize={6} />
        </Box>
      </Flex>
      <StatNumber 
        fontSize="4xl" 
        fontWeight="bold" 
        color="brand.700"
        lineHeight="1"
        mb={2}
      >
        {value}
      </StatNumber>
      <StatHelpText mb={0} fontSize="sm" color="gray.500">{helpText}</StatHelpText>
    </Flex>
    <Box 
      position="absolute" 
      bottom="-10px" 
      right="-10px" 
      bg="brand.50" 
      width="100px" 
      height="100px" 
      borderRadius="full" 
      opacity="0.2" 
      zIndex="0"
    />
  </Stat>
);

const ActionCard = ({ title, description, icon, link }) => (
  <Card 
    as={RouterLink}
    to={link}
    _hover={{
      transform: 'translateY(-5px)',
      boxShadow: 'lg',
      transition: 'all 0.3s ease'
    }}
  >
    <CardBody>
      <Box 
        bg="brand.50" 
        p={3} 
        borderRadius="md" 
        width="fit-content" 
        mb={3}
      >
        <Icon as={icon} color="brand.500" boxSize={5} />
      </Box>
      <Stack spacing={1}>
        <Heading size="sm">{title}</Heading>
        <Text fontSize="sm" color="gray.600">{description}</Text>
      </Stack>
    </CardBody>
  </Card>
);

const RecentMaterialCard = ({ title, type, date, discipline, id, content }) => (
  <Card>
    <CardHeader pb={1}>
      <Heading size="sm">{title}</Heading>
    </CardHeader>
    <CardBody py={2}>
      <Text color="gray.600" fontSize="sm">
        Tipo: {type}
      </Text>
      <Text color="gray.600" fontSize="sm">
        Disciplina: {discipline}
      </Text>
    </CardBody>
    <CardFooter pt={0}>
      <Flex width="100%" justify="space-between" align="center">
        <Text fontSize="xs" color="gray.500">
          <Icon as={FaRegCalendarAlt} mr={1} boxSize={3} />
          {date}
        </Text>
      </Flex>
    </CardFooter>
  </Card>
);

export default Dashboard;