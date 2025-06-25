import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  Image, 
  SimpleGrid, 
  Stack,
  Flex,
  HStack,
  Icon,
  VStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaRobot, FaPencilAlt, FaChalkboardTeacher, FaFileExport } from 'react-icons/fa';
import logo from '../assets/logo(1).svg';

const Home = () => {
  return (
    <Box>
      {/* Hero Section */}
      <Box bgGradient="linear(to-r, brand.600, blue.400)" py={20} color="white">
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
            <Box maxW={{ base: '100%', md: '50%' }} mb={{ base: 10, md: 0 }}>
              <Flex align="center" mb={6}>
                <Image src={logo} alt="EduAI Logo" boxSize="120px" mr={4} />
                <Heading as="h1" size="2xl" mb={4}>
                  EduAI
                </Heading>
              </Flex>
              <Heading 
                as="h1" 
                size="2xl" 
                fontWeight="bold" 
                mb={6}
              >
                Materiais didáticos personalizados com IA
              </Heading>
              <Text fontSize="xl" mb={8}>
                Crie textos, exercícios e avaliações adaptados ao nível de ensino e contexto pedagógico de seus alunos.
              </Text>
              <HStack spacing={4}>
                <Button 
                  as={RouterLink} 
                  to="/register" 
                  size="lg" 
                  bg="white" 
                  color="brand.500" 
                  _hover={{ bg: 'gray.100' }}
                >
                  Começar Agora
                </Button>
                <Button 
                  as={RouterLink}
                  to="/login"
                  size="lg"
                  variant="outline"
                  borderColor="white"
                >
                  Acessar Conta
                </Button>
              </HStack>
            </Box>
            <Box flex="1">
              <Image 
                src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80" 
                alt="Professor usando tecnologia" 
                borderRadius="lg"
                shadow="2xl"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={16}>
        <Container maxW="container.xl">
          <Heading textAlign="center" mb={16}>Funcionalidades Principais</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature 
              icon={FaRobot} 
              title="Geração com IA" 
              text="Geração automática de textos e exercícios personalizados usando inteligência artificial avançada."
            />
            <Feature 
              icon={FaPencilAlt} 
              title="Avaliações Personalizadas" 
              text="Crie avaliações adaptadas a diferentes níveis de dificuldade para suas turmas."
            />
            <Feature 
              icon={FaChalkboardTeacher} 
              title="Adaptação de Conteúdo" 
              text="Adapte materiais para alunos com diferentes perfis de aprendizagem e necessidades específicas."
            />
            <Feature 
              icon={FaFileExport} 
              title="Exportação Fácil" 
              text="Exporte seus materiais em formatos compatíveis como PDF e DOCX para uso imediato."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* Disciplines Section */}
      <Box py={16} bg="gray.50">
        <Container maxW="container.xl">
          <Heading mb={4}>Suporte para Diversas Disciplinas</Heading>
          <Text fontSize="lg" mb={10} color="gray.600">
            Nossa plataforma é ideal para professores de diversas áreas do conhecimento
          </Text>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            <DisciplineCard 
              title="Língua Portuguesa" 
              description="Gere textos, redações, exercícios de gramática e interpretação textual." 
              image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            />
            <DisciplineCard 
              title="Matemática" 
              description="Crie problemas matemáticos, exercícios de álgebra, geometria e aritmética." 
              image="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            />
            <DisciplineCard 
              title="Ciências" 
              description="Elabore conteúdos sobre biologia, física e química adaptados a cada série." 
              image="https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            />
            <DisciplineCard 
              title="História e Geografia" 
              description="Desenvolva materiais sobre eventos históricos, mapas e geografia política." 
              image="https://images.unsplash.com/photo-1461360370896-922624d12aa1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20} bg="brand.500" color="white">
        <Container maxW="container.md" textAlign="center">
          <Heading mb={6}>Transforme sua prática pedagógica</Heading>
          <Text fontSize="xl" mb={8}>
            Economize tempo e crie materiais didáticos de alta qualidade com nossa plataforma de inteligência artificial.
          </Text>
          <Button 
            as={RouterLink} 
            to="/register" 
            size="lg" 
            bg="white" 
            color="brand.500" 
            _hover={{ bg: 'gray.100' }}
          >
            Experimente Gratuitamente
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

// Componente auxiliar para a seção de recursos
const Feature = ({ icon, title, text }) => {
  return (
    <VStack align="center" textAlign="center">
      <Box 
        bg="brand.500" 
        w="70px" 
        h="70px" 
        borderRadius="full" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        mb={4}
      >
        <Icon as={icon} boxSize={6} color="white" />
      </Box>
      <Heading size="md" mb={2}>{title}</Heading>
      <Text color="gray.600">{text}</Text>
    </VStack>
  );
};

// Componente para cartões de disciplinas
const DisciplineCard = ({ title, description, image }) => {
  return (
    <Box 
      borderRadius="lg" 
      overflow="hidden" 
      bg="white" 
      boxShadow="md"
    >
      <Image 
        src={image} 
        alt={title}
        h="200px" 
        w="100%" 
        objectFit="cover"
      />
      <Box p={5}>
        <Heading size="md" mb={2}>{title}</Heading>
        <Text color="gray.600">{description}</Text>
      </Box>
    </Box>
  );
};

export default Home;