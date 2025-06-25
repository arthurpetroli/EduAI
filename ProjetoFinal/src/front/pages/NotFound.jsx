import { Box, Heading, Text, Button, Container, Image } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container maxW="container.md" py={20} textAlign="center">
      <Image 
        src="https://illustrations.popsy.co/amber/crashed-error.svg" 
        alt="Página não encontrada"
        maxW="300px"
        mx="auto"
        mb={8}
      />
      <Heading as="h1" mb={4}>Página não encontrada</Heading>
      <Text fontSize="xl" mb={8} color="gray.600">
        A página que você está procurando não existe ou foi movida.
      </Text>
      <Button 
        as={RouterLink} 
        to="/"
        colorScheme="brand"
        size="lg"
      >
        Voltar para a Página Inicial
      </Button>
    </Container>
  );
};

export default NotFound;