import React from 'react';
import { Box, Container, Heading, Image } from '@chakra-ui/react';
import RegisterForm from '../components/RegisterForm';
import logo from '../assets/education-logo.svg';

const Register = () => {
  return (
    <Container maxW="container.xl" py={10}>
      <Box textAlign="center" mb={10}>
        <Image 
          src={logo}
          alt="Logo Educacional" 
          mx="auto"
          mb={4}
          h="100px"
        />
        <Heading size="xl">Plataforma de Apoio Educacional</Heading>
      </Box>
      
      <RegisterForm />
    </Container>
  );
};

export default Register;