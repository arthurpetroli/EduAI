import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  useToast,
  VStack,
  HStack,
  Card,
  CardBody,
  CardFooter,
  Divider,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  List,
  ListItem,
  Text,
  Badge,
  Switch,
  Flex,
  AccordionItem,
  Accordion,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import contentService from '../services/contentService';
import api from '../services/api';

const ExerciseBuilder = () => {
  const [formData, setFormData] = useState({
    materia: '',
    nivel: '',
    topico: '',
    quantidade_exercicios: 5,
    tipo_exercicio: 'Múltipla Escolha',
  });
  
  const [generatedExercises, setGeneratedExercises] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [exerciseId, setExerciseId] = useState(null);
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar se estamos em modo de edição ao carregar o componente
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      setExerciseId(id);
      setIsEditMode(true);
      fetchExerciseDetails(id);
    }
  }, [location]);

  // Função para buscar detalhes dos exercícios
  const fetchExerciseDetails = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await api.get(`/listas-exercicios/${id}`);
      const exerciseData = response.data;
      
      console.log('Dados recebidos:', exerciseData);
      
      // Preencher o formulário com os dados dos exercícios
      setFormData({
        materia: exerciseData.materia || '',
        nivel: exerciseData.nivel_dificuldade || '',
        topico: exerciseData.titulo?.split(':')[1]?.trim() || exerciseData.titulo || '',
        quantidade_exercicios: exerciseData.exercicios?.length || 5,
        tipo_exercicio: exerciseData.exercicios?.[0]?.tipo === 'dissertativo' 
          ? 'Dissertativo' 
          : 'Múltipla Escolha'
      });
      
      // Definir os exercícios gerados
      setGeneratedExercises({
        ...exerciseData,
        id: exerciseData.id,
        titulo: exerciseData.titulo,
        nivel_dificuldade: exerciseData.nivel_dificuldade,
        exercicios: exerciseData.exercicios || []
      });
      
      toast({
        title: 'Lista de exercícios carregada',
        description: 'A lista foi carregada para visualização/edição',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao buscar lista de exercícios:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista para edição',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleNumberChange = (value) => {
    setFormData({
      ...formData,
      quantidade_exercicios: Number(value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isEditMode) {
        // Atualizar lista de exercícios existente
        // Nota: Como esta funcionalidade não existe na API, vamos apenas simular
        toast({
          title: 'Atualização de exercícios',
          description: 'Para modificar exercícios existentes, edite e salve-os individualmente',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      } else {
        // Criar nova lista de exercícios
        const result = await contentService.generateExerciseList(
          formData.materia,
          formData.nivel,
          formData.topico,
          formData.quantidade_exercicios,
          formData.tipo_exercicio
        );
        
        setGeneratedExercises(result);
        toast({
          title: 'Exercícios gerados com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao processar exercícios:', error);
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'gerar'} exercícios`,
        description: error.response?.data?.detail || 'Ocorreu um erro ao processar sua solicitação',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (!generatedExercises) return;
    
    setIsExporting(true);
    try {
      await contentService.exportExerciseList(generatedExercises.id, format);
      toast({
        title: `Lista exportada como ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
      toast({
        title: 'Erro na exportação',
        description: error.response?.data?.detail || 'Não foi possível exportar a lista',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          {isEditMode ? 'Editar Lista de Exercícios' : 'Gerador de Exercícios'}
        </Heading>
        
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="materia" isRequired>
                  <FormLabel>Matéria</FormLabel>
                  <Select 
                    name="materia"
                    placeholder="Selecione a matéria"
                    value={formData.materia}
                    onChange={handleChange}
                  >
                    <option value="Matemática">Matemática</option>
                    <option value="Português">Português</option>
                    <option value="História">História</option>
                    <option value="Geografia">Geografia</option>
                    <option value="Ciências">Ciências</option>
                    <option value="Física">Física</option>
                    <option value="Química">Química</option>
                    <option value="Biologia">Biologia</option>
                  </Select>
                </FormControl>
                
                <FormControl id="nivel" isRequired>
                  <FormLabel>Nível</FormLabel>
                  <Select 
                    name="nivel"
                    placeholder="Selecione o nível"
                    value={formData.nivel}
                    onChange={handleChange}
                  >
                    <option value="Fundamental I">Fundamental I</option>
                    <option value="Fundamental II">Fundamental II</option>
                    <option value="Médio">Médio</option>
                    <option value="Superior">Superior</option>
                  </Select>
                </FormControl>
                
                <FormControl id="topico" isRequired>
                  <FormLabel>Tópico</FormLabel>
                  <Input 
                    name="topico"
                    placeholder="Ex: Equações do 2º grau"
                    value={formData.topico}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl id="tipo_exercicio">
                  <FormLabel>Tipo de Exercício</FormLabel>
                  <Select 
                    name="tipo_exercicio"
                    value={formData.tipo_exercicio}
                    onChange={handleChange}
                  >
                    <option value="Múltipla Escolha">Múltipla Escolha</option>
                    <option value="Verdadeiro ou Falso">Verdadeiro ou Falso</option>
                    <option value="Dissertativo">Dissertativo</option>
                    <option value="Preenchimento">Preenchimento</option>
                  </Select>
                </FormControl>
                
                <FormControl id="quantidade_exercicios">
                  <FormLabel>Quantidade de Exercícios</FormLabel>
                  <NumberInput 
                    min={1} 
                    max={10} 
                    value={formData.quantidade_exercicios}
                    onChange={handleNumberChange}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isLoading}
                  loadingText="Gerando exercícios..."
                  size="lg"
                >
                  Gerar Exercícios
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
        
        {generatedExercises && (
          <Card variant="outline">
            <CardBody>
              <Heading as="h3" size="md" mb={4}>
                {generatedExercises.titulo}
                <Badge ml={2} colorScheme="green">{generatedExercises.nivel_dificuldade}</Badge>
              </Heading>
              
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="medium">Questões: {generatedExercises.exercicios.length}</Text>
                <HStack>
                  <Text>Mostrar gabarito</Text>
                  <Switch 
                    colorScheme="blue"
                    isChecked={showAnswers}
                    onChange={() => setShowAnswers(!showAnswers)}
                  />
                </HStack>
              </Flex>

              <Accordion allowMultiple>
                {generatedExercises.exercicios.map((exercicio, index) => (
                  <AccordionItem 
                    key={exercicio.id} 
                    mb={3}
                    borderWidth="1px" 
                    borderRadius="md" 
                    overflow="hidden"
                  >
                    <AccordionButton py={3} bg="gray.50">
                      <Box flex="1" textAlign="left" fontWeight="bold">
                        {index + 1}. {exercicio.enunciado}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4}>
                      {exercicio.opcoes && Object.entries(exercicio.opcoes).map(([key, value]) => (
                        <Text 
                          key={key} 
                          ml={6} 
                          mt={2}
                          fontWeight={showAnswers && exercicio.resposta_correta === key ? "bold" : "normal"}
                          color={showAnswers && exercicio.resposta_correta === key ? "green.600" : "inherit"}
                        >
                          {key}) {value} 
                          {showAnswers && exercicio.resposta_correta === key && 
                            <Badge ml={2} colorScheme="green">Resposta Correta</Badge>
                          }
                        </Text>
                      ))}
                      
                      {(!exercicio.opcoes || Object.keys(exercicio.opcoes).length === 0) && (
                        <Box mt={4}>
                          <Text fontWeight="medium">Tipo de resposta: {exercicio.tipo}</Text>
                        </Box>
                      )}

                      {showAnswers && (
                        <Box 
                          mt={4} 
                          p={3} 
                          bg="green.50" 
                          borderRadius="md" 
                          borderLeftWidth={4} 
                          borderLeftColor="green.400"
                        >
                          <Text fontWeight="bold">Resposta Correta:</Text>
                          <Text>{exercicio.resposta_correta}</Text>
                        </Box>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardBody>
            <Divider />
            <CardFooter>
              <HStack spacing={4} justifyContent="center" width="100%">
                <Button 
                  onClick={() => handleExport('pdf')}
                  colorScheme="red" 
                  isLoading={isExporting}
                  variant="outline"
                  leftIcon={<i className="fas fa-file-pdf"></i>}
                >
                  Exportar como PDF
                </Button>
                <Button 
                  onClick={() => handleExport('docx')}
                  colorScheme="blue" 
                  isLoading={isExporting}
                  variant="outline"
                  leftIcon={<i className="fas fa-file-word"></i>}
                >
                  Exportar como DOCX
                </Button>
              </HStack>
            </CardFooter>
          </Card>
        )}
        
        {/* Se estiver em modo de edição, adicionar aviso */}
        {isEditMode && generatedExercises && (
          <Box bg="blue.50" p={4} borderRadius="md" mb={4}>
            <Text>
              Você está visualizando uma lista de exercícios existente. 
              Para fazer alterações complexas, recomendamos gerar uma nova lista.
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
};

export default ExerciseBuilder;