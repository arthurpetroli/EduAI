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
  Text,
  Textarea, // Adicione esta linha
  useToast,
  VStack,
  HStack,
  Card,
  CardBody,
  CardFooter,
  Divider,
} from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import contentService from '../services/contentService';
import api from '../services/api';

const MaterialGenerator = () => {
  const [formData, setFormData] = useState({
    materia: '',
    nivel: '',
    topico: '',
  });
  
  const [generatedText, setGeneratedText] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [materialId, setMaterialId] = useState(null);
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Verificar se estamos em modo de edição ao carregar o componente
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const id = queryParams.get('id');
    
    if (id) {
      setMaterialId(id);
      setIsEditMode(true);
      fetchMaterialDetails(id);
    }
  }, [location]);

  // Função para buscar detalhes do material
  const fetchMaterialDetails = async (id) => {
    try {
      setIsLoading(true);
      
      const response = await api.get(`/materiais/${id}`);
      const material = response.data;
      
      // Preencher o formulário com os dados do material
      setFormData({
        materia: material.materia || '',
        nivel: material.nivel || '',
        topico: material.tema || '',
      });
      
      // Definir o texto gerado
      setGeneratedText({
        id: material.id,
        tema: material.tema,
        conteudo: material.conteudo,
        materia: material.materia,
        nivel: material.nivel
      });
      
      toast({
        title: 'Material carregado',
        description: 'O material foi carregado para edição',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Erro ao buscar material:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o material para edição',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isEditMode) {
        // Atualizar material existente
        const updatedMaterial = await api.put(`/materiais/${materialId}`, {
          tema: formData.topico,
          materia: formData.materia,
          nivel: formData.nivel,
          conteudo: generatedText?.conteudo || ''
        });
        
        setGeneratedText({
          id: updatedMaterial.data.id,
          tema: updatedMaterial.data.tema,
          conteudo: updatedMaterial.data.conteudo,
          materia: updatedMaterial.data.materia,
          nivel: updatedMaterial.data.nivel
        });
        
        toast({
          title: 'Material atualizado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Criar novo material
        const result = await contentService.generateSupportText(
          formData.materia,
          formData.nivel,
          formData.topico
        );
        
        setGeneratedText(result);
        toast({
          title: 'Material gerado com sucesso!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Erro ao processar material:', error);
      toast({
        title: `Erro ao ${isEditMode ? 'atualizar' : 'gerar'} material`,
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
    if (!generatedText) return;
    
    setIsExporting(true);
    try {
      await contentService.exportText(generatedText.id, format);
      toast({
        title: `Material exportado como ${format.toUpperCase()}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(`Erro ao exportar como ${format}:`, error);
      toast({
        title: 'Erro na exportação',
        description: error.response?.data?.detail || 'Não foi possível exportar o material',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Função para atualizar o conteúdo do material
  const handleContentChange = (e) => {
    if (generatedText) {
      setGeneratedText({
        ...generatedText,
        conteudo: e.target.value
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          {isEditMode ? 'Editar Material Didático' : 'Gerador de Material Didático'}
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
                
                <Button 
                  type="submit" 
                  colorScheme="blue" 
                  isLoading={isLoading}
                  loadingText={isEditMode ? "Atualizando material..." : "Gerando material..."}
                  size="lg"
                >
                  {isEditMode ? 'Atualizar Material' : 'Gerar Material'}
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>
        
        {generatedText && (
          <Card variant="outline">
            <CardBody>
              <Heading as="h2" size="lg" mb={4} color="blue.700" textAlign="center">
                {generatedText.tema}
              </Heading>
              {isEditMode ? (
                <FormControl>
                  <FormLabel>Conteúdo do Material</FormLabel>
                  <Textarea 
                    value={generatedText.conteudo || ''} 
                    onChange={handleContentChange}
                    minHeight="400px"
                    p={4}
                    fontFamily="monospace"
                  />
                </FormControl>
              ) : (
                <Box 
                  borderWidth={1} 
                  borderRadius="md" 
                  p={4} 
                  bg="gray.50"
                  maxHeight="60vh"
                  overflowY="auto"
                >
                  <ReactMarkdown>{generatedText.conteudo}</ReactMarkdown>
                </Box>
              )}
            </CardBody>
            <Divider />
            <CardFooter>
              <VStack spacing={4} width="100%">
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
                
                {/* Mantém o botão de salvar alterações em uma linha separada quando estiver em modo de edição */}
                {isEditMode && (
                  <Button 
                    colorScheme="green"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    alignSelf="center"
                  >
                    Salvar Alterações
                  </Button>
                )}
              </VStack>
            </CardFooter>
          </Card>
        )}
      </VStack>
    </Container>
  );
};

export default MaterialGenerator;