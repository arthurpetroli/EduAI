import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Flex,
  VStack,
  HStack,
  Divider,
  Button,
  Image,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Link,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaBook,
  FaChalkboardTeacher,
  FaClipboardList,
  FaRobot,
  FaFileAlt,
  FaChartBar,
  FaGraduationCap,
  FaClock,
  FaLightbulb,
  FaBrain,
} from 'react-icons/fa';
import logo from '../assets/logo(1).svg';

const About = () => {
  const bgGradient = useColorModeValue(
    'linear(to-b, blue.50, white)',
    'linear(to-b, gray.800, gray.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('blue.600', 'blue.300');
  
  return (
    <Box>
      {/* Seção Hero */}
      <Box 
        bgGradient={bgGradient}
        pt={20} 
        pb={12}
        px={4}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} alignItems="center" textAlign="center">
            <Image src={logo} alt="EduAI Logo" boxSize="180px" />
            <Heading as="h1" size="2xl" mb={4}>
              EduAI - Transformando a Educação com Inteligência Artificial
            </Heading>
            <Text fontSize="xl" maxW="800px" color={textColor}>
              Uma plataforma desenvolvida para auxiliar educadores na criação de materiais didáticos, 
              exercícios e avaliações de forma rápida, eficiente e personalizada utilizando o poder da IA.
            </Text>
            <HStack spacing={6} mt={6}>
              <Button 
                as={RouterLink} 
                to="/register" 
                colorScheme="blue" 
                size="lg"
              >
                Começar Agora
              </Button>
              <Button 
                as={RouterLink} 
                to="/library" 
                variant="outline" 
                colorScheme="blue" 
                size="lg"
              >
                Explorar Biblioteca
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Seção Sobre o Projeto */}
      <Container maxW="container.xl" py={16}>
        <VStack spacing={12} align="stretch">
          <VStack spacing={4} align="center" textAlign="center" mb={8}>
            <Heading as="h2" size="xl" color={headingColor}>
              Sobre o EduAI
            </Heading>
            <Divider maxW="100px" borderColor="blue.500" borderWidth={2} />
            <Text fontSize="lg" maxW="800px" color={textColor}>
              O EduAI nasceu da necessidade de facilitar o trabalho docente, permitindo que educadores 
              foquem mais no ensino e menos na preparação de materiais. Nossa plataforma utiliza 
              inteligência artificial avançada para gerar conteúdos educacionais de qualidade, 
              economizando tempo e potencializando os resultados em sala de aula.
            </Text>
          </VStack>

          {/* Missão, Visão e Valores */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box 
              bg={cardBg} 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              textAlign="center"
            >
              <Icon as={FaLightbulb} w={12} h={12} color="yellow.500" mb={4} />
              <Heading as="h3" size="md" mb={4}>
                Missão
              </Heading>
              <Text color={textColor}>
                Democratizar o acesso à tecnologia educacional, tornando a IA acessível a todos os educadores 
                para melhorar a qualidade do ensino e aprendizagem.
              </Text>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              textAlign="center"
            >
              <Icon as={FaGraduationCap} w={12} h={12} color="blue.500" mb={4} />
              <Heading as="h3" size="md" mb={4}>
                Visão
              </Heading>
              <Text color={textColor}>
                Ser a principal ferramenta de apoio ao professor do século XXI, integrando IA responsável 
                ao processo educacional para criar experiências de aprendizado mais eficazes e personalizadas.
              </Text>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              textAlign="center"
            >
              <Icon as={FaChalkboardTeacher} w={12} h={12} color="green.500" mb={4} />
              <Heading as="h3" size="md" mb={4}>
                Valores
              </Heading>
              <Text color={textColor}>
                Inovação, acessibilidade, qualidade pedagógica, privacidade de dados e suporte contínuo 
                à comunidade educacional são nossos pilares fundamentais.
              </Text>
            </Box>
          </SimpleGrid>

          {/* Como Funciona */}
          <VStack spacing={4} align="center" textAlign="center" mt={12} mb={8}>
            <Heading as="h2" size="xl" color={headingColor}>
              Como Funciona
            </Heading>
            <Divider maxW="100px" borderColor="blue.500" borderWidth={2} />
            <Text fontSize="lg" maxW="800px" color={textColor}>
              Nossa plataforma utiliza algoritmos avançados de IA para entender suas necessidades 
              pedagógicas e gerar conteúdo relevante e adaptado ao perfil dos seus alunos.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Box 
              bg={cardBg} 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              position="relative"
              overflow="hidden"
            >
              <Box 
                position="absolute" 
                top="-10px" 
                right="-10px" 
                bg="blue.100" 
                w="100px" 
                h="100px" 
                borderRadius="full" 
                opacity="0.3" 
              />
              <VStack align="start" spacing={4} position="relative" zIndex="1">
                <Flex 
                  align="center" 
                  justify="center" 
                  bg="blue.100" 
                  w={14} 
                  h={14} 
                  borderRadius="full"
                >
                  <Icon as={FaRobot} w={6} h={6} color="blue.500" />
                </Flex>
                <Heading as="h3" size="md">
                  Inteligência Artificial Educacional
                </Heading>
                <Text color={textColor}>
                  O EduAI conta com modelos de linguagem especializada em conteúdo educacional, 
                  capaz de gerar textos de apoio, exercícios e avaliações alinhados às práticas 
                  pedagógicas modernas e adequados à faixa etária dos estudantes.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={8} 
              borderRadius="lg" 
              boxShadow="md"
              position="relative"
              overflow="hidden"
            >
              <Box 
                position="absolute" 
                top="-10px" 
                right="-10px" 
                bg="green.100" 
                w="100px" 
                h="100px" 
                borderRadius="full" 
                opacity="0.3" 
              />
              <VStack align="start" spacing={4} position="relative" zIndex="1">
                <Flex 
                  align="center" 
                  justify="center" 
                  bg="green.100" 
                  w={14} 
                  h={14} 
                  borderRadius="full"
                >
                  <Icon as={FaClock} w={6} h={6} color="green.500" />
                </Flex>
                <Heading as="h3" size="md">
                  Economia de Tempo
                </Heading>
                <Text color={textColor}>
                  O que antes levava horas para ser produzido, agora pode ser gerado em minutos. 
                  Nossa plataforma entende seu pedido, cria o conteúdo e permite personalização 
                  e exportação nos formatos mais utilizados, como PDF e DOCX.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Principais Recursos */}
          <VStack spacing={4} align="center" textAlign="center" mt={16} mb={8}>
            <Heading as="h2" size="xl" color={headingColor}>
              Principais Recursos
            </Heading>
            <Divider maxW="100px" borderColor="blue.500" borderWidth={2} />
            <Text fontSize="lg" maxW="800px" color={textColor}>
              O EduAI oferece um conjunto completo de ferramentas para auxiliar educadores em diferentes atividades.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaFileAlt} w={10} h={10} color="blue.500" />
                <Heading as="h3" size="md">
                  Geração de Material Didático
                </Heading>
                <Text color={textColor}>
                  Crie textos de apoio, resumos e explicações sobre qualquer tópico educacional. 
                  Especifique a matéria, nível de ensino e o assunto desejado para obter conteúdo personalizado.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaClipboardList} w={10} h={10} color="green.500" />
                <Heading as="h3" size="md">
                  Criação de Exercícios
                </Heading>
                <Text color={textColor}>
                  Gere listas de exercícios com diferentes níveis de dificuldade e formatos. 
                  Escolha entre questões de múltipla escolha ou dissertativas, controle a quantidade 
                  e obtenha gabaritos automaticamente.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaChartBar} w={10} h={10} color="purple.500" />
                <Heading as="h3" size="md">
                  Elaboração de Avaliações
                </Heading>
                <Text color={textColor}>
                  Monte avaliações completas com cabeçalho, instruções e questões variadas. 
                  Organize o conteúdo, defina o nível de dificuldade e obtenha uma avaliação 
                  pronta para aplicação.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaBook} w={10} h={10} color="orange.500" />
                <Heading as="h3" size="md">
                  Biblioteca de Materiais
                </Heading>
                <Text color={textColor}>
                  Organize todos os seus materiais em uma biblioteca digital. Pesquise, filtre 
                  e acesse rapidamente qualquer conteúdo criado anteriormente.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaFileAlt} w={10} h={10} color="red.500" />
                <Heading as="h3" size="md">
                  Exportação de Documentos
                </Heading>
                <Text color={textColor}>
                  Exporte seus materiais nos formatos PDF e DOCX, prontos para impressão ou 
                  compartilhamento digital com seus alunos.
                </Text>
              </VStack>
            </Box>
            
            <Box 
              bg={cardBg} 
              p={6} 
              borderRadius="lg" 
              boxShadow="md"
              transition="all 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <VStack spacing={4} align="start">
                <Icon as={FaChalkboardTeacher} w={10} h={10} color="teal.500" />
                <Heading as="h3" size="md">
                  Dashboard Personalizado
                </Heading>
                <Text color={textColor}>
                  Acompanhe suas estatísticas de uso, histórico de criações e acesse rapidamente 
                  suas ferramentas favoritas em um painel intuitivo.
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>

          {/* Perguntas Frequentes */}
          <VStack spacing={4} align="center" textAlign="center" mt={16} mb={8}>
            <Heading as="h2" size="xl" color={headingColor}>
              Perguntas Frequentes
            </Heading>
            <Divider maxW="100px" borderColor="blue.500" borderWidth={2} />
          </VStack>

          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    Como a IA do EduAI cria conteúdo educacional?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color={textColor}>
                Nossa IA foi treinada com milhões de documentos educacionais de alta qualidade. 
                Quando você faz uma solicitação, nossos algoritmos processam sua intenção, 
                selecionam as informações mais relevantes e geram conteúdo que atenda aos 
                critérios pedagógicos modernos, sempre respeitando a precisão das informações.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    O conteúdo gerado pela IA precisa ser revisado?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color={textColor}>
                Embora nossa IA produza conteúdo de alta qualidade, recomendamos que o educador 
                sempre revise o material gerado antes de utilizá-lo, especialmente para garantir que 
                esteja alinhado com seu plano de ensino específico e adaptado ao contexto de seus alunos.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    Quais disciplinas o EduAI consegue abordar?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color={textColor}>
                O EduAI é capaz de gerar conteúdo para praticamente todas as disciplinas do currículo 
                escolar tradicional, incluindo Matemática, Português, História, Geografia, Ciências, Biologia, 
                Física, Química, Educação Física, Artes e muito mais.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    Como faço para começar a usar o EduAI?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color={textColor}>
                Começar é simples! Basta criar uma conta gratuita, acessar o dashboard e escolher 
                qual tipo de conteúdo deseja criar. O processo é intuitivo e guiado, permitindo que 
                você especifique suas necessidades e obtenha resultados em minutos.
              </AccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <h2>
                <AccordionButton py={4}>
                  <Box flex="1" textAlign="left" fontWeight="semibold">
                    O EduAI pode substituir professores?
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4} color={textColor}>
                Definitivamente não! O EduAI foi projetado para ser uma ferramenta de apoio ao trabalho 
                docente, nunca um substituto. Acreditamos que a tecnologia deve potencializar o trabalho 
                humano, permitindo que educadores dediquem mais tempo às interações significativas com 
                seus alunos e menos tempo em tarefas repetitivas.
              </AccordionPanel>
            </AccordionItem>
          </Accordion>

          {/* Chamada Final */}
          <Box 
            mt={16} 
            p={10} 
            borderRadius="lg" 
            bgGradient="linear(to-r, blue.400, purple.500)"
            color="white"
            textAlign="center"
          >
            <VStack spacing={6}>
              <Heading size="lg">
                Transforme sua maneira de preparar aulas e avaliações
              </Heading>
              <Text fontSize="lg" maxW="700px">
                Junte-se a milhares de educadores que já estão usando o EduAI para economizar tempo 
                e criar materiais didáticos de qualidade. Registre-se hoje e comece a experimentar o futuro da educação!
              </Text>
              <Button 
                as={RouterLink} 
                to="/register" 
                size="lg" 
                bg="white" 
                color="blue.500" 
                _hover={{ bg: "gray.100" }}
              >
                Criar Conta Gratuita
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default About;