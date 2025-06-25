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
  VStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const RegisterForm = () => { // Removemos as props não utilizadas
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validação básica
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Registrar o usuário
      await authService.register(username, password);
      
      toast({
        title: 'Usuário registrado com sucesso!',
        description: 'Agora você pode fazer login',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Indicar que o registro foi bem-sucedido e mostrar a opção para ir para o login
      setIsRegistered(true);
      
    } catch (error) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Nome de usuário já registrado. Escolha outro.';
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // Use replace: true para evitar que o usuário volte para a tela de registro
    // quando clicar no botão voltar do navegador após fazer login
    navigate('/login', { replace: true });
  };

  return (
    <Box maxW="md" mx="auto" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
      <Heading mb={6} textAlign="center">Cadastro</Heading>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {isRegistered ? (
        // Mostrar mensagem de sucesso e botão para ir para o login
        <VStack spacing={4}>
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            Cadastro realizado com sucesso!
          </Alert>
          <Button 
            colorScheme="blue" 
            width="full"
            onClick={handleLoginRedirect}
          >
            Ir para o Login
          </Button>
        </VStack>
      ) : (
        // Mostrar o formulário de registro
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
            
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>Confirmar Senha</FormLabel>
              <Input 
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </FormControl>
            
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isLoading}
              loadingText="Registrando..."
            >
              Criar Conta
            </Button>
            
            <Text textAlign="center">
              Já tem uma conta? {" "}
              <Button variant="link" colorScheme="blue" onClick={handleLoginRedirect}>
                Faça Login
              </Button>
            </Text>
          </Stack>
        </form>
      )}
    </Box>
  );
};

export default RegisterForm;