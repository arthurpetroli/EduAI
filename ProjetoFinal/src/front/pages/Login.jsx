import React from 'react';
import { Box, Container, Heading, Image } from '@chakra-ui/react';
import LoginForm from '../components/LoginForm';

const Login = ({ onLogin }) => {
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={10}>
        <Image 
          src="assets/education-logo.svg" // Remover a barra inicial
          alt="Logo Educacional" 
          mx="auto"
          mb={4}
          h="100px"
        />
        <Heading size="xl">Plataforma de Apoio Educacional</Heading>
      </Box>
      
      <LoginForm onLogin={onLogin} />
    </Container>
  );
};

export default Login;