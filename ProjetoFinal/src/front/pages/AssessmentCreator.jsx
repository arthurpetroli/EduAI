import React, { useState, useRef, useEffect } from 'react';
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
  Card,
  CardBody,
  CardFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  HStack,
  Text,
  Divider,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  IconButton,
  Flex,
  Badge,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tabs, 
  TabList, 
  TabPanels, 
  Tab, 
  TabPanel,
  Icon
} from '@chakra-ui/react';
import { DragHandleIcon, DeleteIcon, EditIcon, AddIcon, DownloadIcon } from '@chakra-ui/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import contentService from '../services/contentService';
import api from '../services/api';
import { FaFileExport } from 'react-icons/fa';

const AssessmentCreator = () => {
  const [formData, setFormData] = useState({
    materia: '',
    nivel: '',
    topico: '',
    quantidade_exercicios: 5,
    dificuldade: 'medio'
  });
  
  const [assessment, setAssessment] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [assessmentId, setAssessmentId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentEditQuestion, setCurrentEditQuestion] = useState(null);
  const headerRef = useRef();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar se estamos em modo de edição ao carregar o componente
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      setAssessmentId(id);
      setIsEditMode(true);
      fetchAssessmentDetails(id);
    }
  }, [location]);

  // Função para buscar detalhes da avaliação
  const fetchAssessmentDetails = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await api.get(`/listas-exercicios/${id}`);
      const assessmentData = response.data;
      
      console.log('Dados da avaliação recebidos:', assessmentData);
      
      // Preencher o formulário com os dados da avaliação
      setFormData({
        materia: assessmentData.materia || '',
        nivel: assessmentData.nivel_dificuldade || '',
        topico: assessmentData.titulo?.split(':')[1]?.trim() || assessmentData.titulo || '',
        quantidade_exercicios: assessmentData.exercicios?.length || 5,
        dificuldade: mapDificuldade(assessmentData.nivel_dificuldade)
      });
      
      // Definir a avaliação carregada
      setAssessment({
        id: assessmentData.id,
        titulo: assessmentData.titulo,
        materia: assessmentData.materia,
        nivel_dificuldade: assessmentData.nivel_dificuldade,
        cabecalho: assessmentData.cabecalho || '',
        instrucoes: assessmentData.instrucoes || '',
        exercicios: assessmentData.exercicios || []
      });
      
      toast({
        title: 'Avaliação carregada',
        description: 'A avaliação foi carregada para visualização/edição',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao buscar avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a avaliação para edição',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Adicione esta função auxiliar para mapear o nível de dificuldade
  const mapDificuldade = (nivel) => {
    if (!nivel) return 'medio';
    nivel = nivel.toLowerCase();
    if (nivel.includes('fác')) return 'facil';
    if (nivel.includes('dif')) return 'dificil';
    return 'medio';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDificuldadeChange = (value) => {
    setFormData({
      ...formData,
      dificuldade: value
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
        // Atualizar avaliação existente
        // Nota: Como esta funcionalidade não existe na API, vamos apenas simular
        toast({
          title: 'Atualização de avaliação',
          description: 'Para modificar avaliações existentes, edite as questões individualmente',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      } else {
        // Criar nova avaliação
        const result = await contentService.generateAssessment(
          formData.materia,
          formData.nivel,
          formData.topico,
          formData.quantidade_exercicios,
          formData.dificuldade
        );
        
        setAssessment(result);
        
        toast({
          title: 'Avaliação gerada com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        // Rolar para a avaliação gerada
        setTimeout(() => {
          window.scrollTo({
            top: document.getElementById('assessment-result').offsetTop - 20,
            behavior: 'smooth'
          });
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao processar avaliação:', error);
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'gerar'} avaliação`,
        description: error.response?.data?.detail || 'Ocorreu um erro ao processar sua solicitação',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(assessment.exercicios);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setAssessment({
      ...assessment,
      exercicios: items
    });
  };

  const handleHeaderChange = (e) => {
    setAssessment({
      ...assessment,
      cabecalho: e.target.value
    });
  };

  const handleInstructionsChange = (e) => {
    setAssessment({
      ...assessment,
      instrucoes: e.target.value
    });
  };

  const handleDeleteQuestion = (index) => {
    const updatedExercicios = [...assessment.exercicios];
    updatedExercicios.splice(index, 1);
    
    setAssessment({
      ...assessment,
      exercicios: updatedExercicios
    });
    
    toast({
      title: 'Questão removida',
      status: 'info',
      duration: 2000,
    });
  };

  const handleEditQuestion = (index) => {
    setCurrentEditQuestion({
      ...assessment.exercicios[index],
      index
    });
    onOpen();
  };

  const saveQuestionEdit = () => {
    const updatedExercicios = [...assessment.exercicios];
    updatedExercicios[currentEditQuestion.index] = {
      id: currentEditQuestion.id,
      enunciado: currentEditQuestion.enunciado,
      tipo: currentEditQuestion.tipo,
      opcoes: currentEditQuestion.opcoes,
      resposta_correta: currentEditQuestion.resposta_correta
    };
    
    setAssessment({
      ...assessment,
      exercicios: updatedExercicios
    });
    
    onClose();
    toast({
      title: 'Questão atualizada',
      status: 'success',
      duration: 2000,
    });
  };

  const handleExport = async (format) => {
    if (!assessment) return;
    
    setIsExporting(true);
    try {
      // Usando o mesmo padrão dos outros geradores
      await contentService.exportExerciseList(assessment.id, format);
      
      toast({
        title: `Avaliação exportada como ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
      toast({
        title: 'Erro na exportação',
        description: error.response?.data?.detail || 'Não foi possível exportar a avaliação',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOptionChange = (optionKey, value) => {
    setCurrentEditQuestion({
      ...currentEditQuestion,
      opcoes: {
        ...currentEditQuestion.opcoes,
        [optionKey]: value
      }
    });
  };

  const handleCorrectAnswerChange = (value) => {
    setCurrentEditQuestion({
      ...currentEditQuestion,
      resposta_correta: value
    });
  };

  const handleEnunciadoChange = (e) => {
    setCurrentEditQuestion({
      ...currentEditQuestion,
      enunciado: e.target.value
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          {isEditMode ? 'Editar Avaliação' : 'Gerador de Avaliações'}
        </Heading>
        
        <Card>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <Stack spacing={6}>
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
                
                <FormControl id="quantidade_exercicios">
                  <FormLabel>Quantidade de Exercícios</FormLabel>
                  <NumberInput 
                    min={1} 
                    max={20} 
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
                
                {/* Seção simplificada de dificuldade */}
                <FormControl id="dificuldade" isRequired>
                  <FormLabel>Nível de Dificuldade</FormLabel>
                  <RadioGroup 
                    onChange={handleDificuldadeChange} 
                    value={formData.dificuldade}
                    colorScheme="blue"
                  >
                    <HStack spacing={6} justify="space-around">
                      <Radio value="facil">
                        <HStack>
                          <Box w={3} h={3} borderRadius="full" bg="green.400" />
                          <Text>Fácil</Text>
                        </HStack>
                      </Radio>
                      <Radio value="medio">
                        <HStack>
                          <Box w={3} h={3} borderRadius="full" bg="orange.400" />
                          <Text>Médio</Text>
                        </HStack>
                      </Radio>
                      <Radio value="dificil">
                        <HStack>
                          <Box w={3} h={3} borderRadius="full" bg="red.400" />
                          <Text>Difícil</Text>
                        </HStack>
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isLoading}
                  loadingText="Gerando avaliação..."
                  size="lg"
                  leftIcon={<i className="fas fa-file-alt"></i>}
                >
                  Gerar Avaliação
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
        
        {/* Seção de visualização e edição da avaliação gerada */}
        {assessment && (
          <Box id="assessment-result">
            <Card variant="outline">
              <CardBody>
                <Tabs variant="enclosed">
                  <TabList>
                    <Tab>Visualizar</Tab>
                    <Tab>Editar</Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* Aba de visualização */}
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        <Box bg="gray.50" p={4} borderRadius="md">
                          <Heading as="h3" size="md" mb={2}>
                            {assessment.titulo}
                          </Heading>
                          <Text whiteSpace="pre-line">{assessment.cabecalho}</Text>
                          <Text mt={4} fontStyle="italic">{assessment.instrucoes}</Text>
                        </Box>
                        
                        <Flex justify="space-between" align="center" mb={2}>
                          <Text fontWeight="medium">Total: {assessment.exercicios.length} questões</Text>
                          <HStack>
                            <Text>Mostrar gabarito</Text>
                            <Switch 
                              colorScheme="blue"
                              isChecked={showAnswers}
                              onChange={() => setShowAnswers(!showAnswers)}
                            />
                          </HStack>
                        </Flex>
                        
                        <Accordion allowToggle defaultIndex={[0]}>
                          {assessment.exercicios.map((exercicio, index) => (
                            <AccordionItem key={exercicio.id || index}>
                              <AccordionButton py={3} px={4}>
                                <Box flex="1" textAlign="left" fontWeight="medium">
                                  {index + 1}. {exercicio.enunciado.substring(0, 80)}...
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4} pt={2}>
                                <Text mb={4}>{exercicio.enunciado}</Text>
                                
                                {exercicio.opcoes && Object.entries(exercicio.opcoes).map(([key, value]) => (
                                  <Box 
                                    key={key} 
                                    py={1} 
                                    pl={4}
                                    backgroundColor={showAnswers && exercicio.resposta_correta === key ? "green.50" : "transparent"}
                                    borderLeftWidth={showAnswers && exercicio.resposta_correta === key ? 4 : 0}
                                    borderLeftColor="green.400"
                                  >
                                    <Text>
                                      <strong>{key})</strong> {value}
                                      {showAnswers && exercicio.resposta_correta === key && 
                                        <Badge ml={2} colorScheme="green">Correta</Badge>
                                      }
                                    </Text>
                                  </Box>
                                ))}
                                
                                {showAnswers && (
                                  <Box mt={4} p={3} bg="blue.50" borderRadius="md">
                                    <Text fontWeight="bold">Resposta: {exercicio.resposta_correta}</Text>
                                  </Box>
                                )}
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </VStack>
                    </TabPanel>
                    
                    {/* Aba de edição */}
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        <FormControl>
                          <FormLabel>Cabeçalho</FormLabel>
                          <Textarea 
                            value={assessment.cabecalho || ''}
                            onChange={handleHeaderChange}
                            placeholder="Cabeçalho da avaliação"
                            rows={3}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel>Instruções</FormLabel>
                          <Textarea 
                            value={assessment.instrucoes || ''}
                            onChange={handleInstructionsChange}
                            placeholder="Instruções para os alunos"
                            rows={2}
                          />
                        </FormControl>
                        
                        <Box>
                          <Heading as="h4" size="sm" mb={2}>
                            Questões ({assessment.exercicios.length})
                          </Heading>
                          
                          <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="questoes">
                              {(provided) => (
                                <Box
                                  {...provided.droppableProps}
                                  ref={provided.innerRef}
                                >
                                  {assessment.exercicios.map((exercicio, index) => (
                                    <Draggable
                                      key={exercicio.id || index}
                                      draggableId={exercicio.id?.toString() || `question-${index}`}
                                      index={index}
                                    >
                                      {(provided) => (
                                        <Box
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          mb={2}
                                          borderWidth="1px"
                                          borderRadius="md"
                                          overflow="hidden"
                                        >
                                          <Flex
                                            bg="gray.50"
                                            p={3}
                                            justify="space-between"
                                            align="center"
                                          >
                                            <HStack>
                                              <Box
                                                {...provided.dragHandleProps}
                                                color="gray.500"
                                                cursor="grab"
                                              >
                                                <DragHandleIcon />
                                              </Box>
                                              <Text fontWeight="medium">
                                                {index + 1}. {exercicio.enunciado.substring(0, 50)}...
                                              </Text>
                                            </HStack>
                                            <HStack>
                                              <IconButton
                                                icon={<EditIcon />}
                                                size="sm"
                                                aria-label="Editar questão"
                                                colorScheme="blue"
                                                variant="ghost"
                                                onClick={() => handleEditQuestion(index)}
                                              />
                                              <IconButton
                                                icon={<DeleteIcon />}
                                                size="sm"
                                                aria-label="Remover questão"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleDeleteQuestion(index)}
                                              />
                                            </HStack>
                                          </Flex>
                                        </Box>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                </Box>
                              )}
                            </Droppable>
                          </DragDropContext>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
              
              <Divider />
              
              <CardFooter>
                <HStack spacing={4} justifyContent="center" width="100%">
                  <Button 
                    onClick={() => handleExport('pdf')}
                    colorScheme="red" 
                    isLoading={isExporting}
                    loadingText="Exportando..."
                    leftIcon={<i className="fas fa-file-pdf"></i>}
                  >
                    Exportar como PDF
                  </Button>
                  <Button 
                    onClick={() => handleExport('docx')}
                    colorScheme="blue" 
                    isLoading={isExporting}
                    loadingText="Exportando..."
                    leftIcon={<i className="fas fa-file-word"></i>}
                  >
                    Exportar como DOCX
                  </Button>
                </HStack>
              </CardFooter>
            </Card>
          </Box>
        )}
      </VStack>
      
      {/* Modal para edição de questão */}
      {currentEditQuestion && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Questão</ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Enunciado</FormLabel>
                  <Textarea
                    value={currentEditQuestion.enunciado}
                    onChange={handleEnunciadoChange}
                    rows={4}
                  />
                </FormControl>
                
                {currentEditQuestion.opcoes && Object.keys(currentEditQuestion.opcoes).length > 0 && (
                  <>
                    <Heading as="h4" size="sm">Opções</Heading>
                    
                    {Object.entries(currentEditQuestion.opcoes).map(([key, value]) => (
                      <FormControl key={key}>
                        <FormLabel>Alternativa {key}</FormLabel>
                        <HStack>
                          <Radio
                            isChecked={currentEditQuestion.resposta_correta === key}
                            onChange={() => handleCorrectAnswerChange(key)}
                            colorScheme="green"
                          />
                          <Input
                            value={value}
                            onChange={(e) => handleOptionChange(key, e.target.value)}
                          />
                        </HStack>
                      </FormControl>
                    ))}
                    
                    <Text fontSize="sm" color="blue.500">
                      Selecione o botão ao lado da opção para marcá-la como correta.
                    </Text>
                  </>
                )}
              </VStack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button colorScheme="blue" onClick={saveQuestionEdit}>
                Salvar Alterações
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AssessmentCreator;