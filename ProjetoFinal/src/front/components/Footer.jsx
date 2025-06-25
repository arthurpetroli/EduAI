import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Container, 
  SimpleGrid,
  Heading, 
  Text, 
  Link, 
  VStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';

const Footer = () => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.400");
  
  return (
    <Box as="footer" bg={bgColor} borderTop="1px" borderColor={borderColor}>
      <Container maxW="container.xl" py={10}>
        <SimpleGrid 
          templateColumns={{ base: "1fr", md: "1fr 1fr", lg: "2fr 1fr 1fr" }}
          spacing={{ base: 8, md: 10 }}
        >
          {/* Logo e descrição */}
          <Box>
            <Heading as="h3" size="md" mb={3} color="blue.500">EduAI</Heading>
            <Text color={textColor} fontSize="md" maxW="90%">
              Transformando o ensino através da inteligência artificial para educadores.
            </Text>
          </Box>
          
          {/* Links de navegação */}
          <Box>
            <Heading as="h4" size="sm" fontWeight="600" mb={4} letterSpacing="0.5px">
              Navegação
            </Heading>
            <VStack align="flex-start" spacing={3}>
              <FooterLink as={RouterLink} to="/">Início</FooterLink>
              <FooterLink as={RouterLink} to="/library">Biblioteca de Materiais</FooterLink>
              <FooterLink as={RouterLink} to="/sobre">Sobre</FooterLink>
              <FooterLink 
                as={RouterLink} 
                to={localStorage.getItem('token') ? "/dashboard" : "/login"}
              >
                {localStorage.getItem('token') ? "Dashboard" : "Login"}
              </FooterLink>
            </VStack>
          </Box>
          
          {/* Contato */}
          <Box>
            <Heading as="h4" size="sm" fontWeight="600" mb={4} letterSpacing="0.5px">
              Contato
            </Heading>
            <VStack align="flex-start" spacing={3} color={textColor}>
              <Text fontSize="sm">Email: <Link color="blue.500" href="mailto:arthurpetroli@alunos.utfpr.edu.br">arthurpetroli@alunos.utfpr.edu.br</Link></Text>
              <Text fontSize="sm">Telefone: (19) 98348-4303</Text>
              <Text fontSize="sm">Endereço: R. Marcílio Dias, 635</Text>
            </VStack>
          </Box>
        </SimpleGrid>
      </Container>
      
      <Divider borderColor={borderColor} />
      
      <Box py={4} textAlign="center" color={textColor}>
        <Text fontSize="sm">&copy; {new Date().getFullYear()} EduAI. Todos os direitos reservados.</Text>
      </Box>
    </Box>
  );
};

const FooterLink = ({ children, ...rest }) => {
  return (
    <Link 
      fontSize="sm"
      color="gray.600" 
      _hover={{ color: "blue.500", textDecoration: "none" }}
      fontWeight="500"
      {...rest}
    >
      {children}
    </Link>
  );
};

export default Footer;