import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginForm = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Fazer login e obter dados do usuário
      const userData = await authService.login(username, password);
      console.log('Login bem-sucedido:', userData);
      
      toast({
        title: 'Login realizado com sucesso',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Notificar o componente pai sobre o login
      if (onLogin) {
        onLogin(userData);
      }
      
      // Redirecionar após um pequeno atraso
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (error) {
      console.error('Erro no login:', error);
      
      let mensagemErro = 'Falha na autenticação. Verifique suas credenciais.';
      if (error.response) {
        if (error.response.status === 401) {
          mensagemErro = 'Nome de usuário ou senha incorretos';
        } else if (error.response.data?.detail) {
          mensagemErro = error.response.data.detail;
        }
      }
      
      setError(mensagemErro);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <Box maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center">Login</Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl id="username" isRequired>
            <FormLabel>Nome de usuário</FormLabel>
            <Input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          
          <FormControl id="password" isRequired>
            <FormLabel>Senha</FormLabel>
            <InputGroup>
              <Input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>
          
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isLoading}
            loadingText="Entrando..."
          >
            Entrar
          </Button>
          
          <Text textAlign="center">
            Ainda não tem uma conta? {" "}
            <Button variant="link" colorScheme="blue" onClick={handleRegisterClick}>
              Registre-se
            </Button>
          </Text>
        </Stack>
      </form>
    </Box>
  );
};

export default LoginForm;