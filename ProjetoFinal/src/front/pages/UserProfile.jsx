import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Avatar,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  IconButton,
  Badge,
  useToast,
  Divider,
  Spinner,
  Center,
  Flex,
  Tooltip,
  useColorModeValue,
  Tag,
  TagLabel,
  TagLeftIcon,
  Image,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon
} from '@chakra-ui/react';
import { 
  FaCamera, 
  FaEdit, 
  FaUniversity, 
  FaGraduationCap, 
  FaLinkedin, 
  FaGithub,
  FaMapMarkerAlt,
  FaUser,
  FaEnvelope,
  FaSave,
  FaIdCard,
  FaBookReader,
  FaInfoCircle,
  FaCog,
  FaBell
} from 'react-icons/fa';
import authService from '../services/authService';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    nickname: '',
    email: '',
    username: '',
    bio: '',
    location: '',
    university: '',
    degree: '',
    gradYear: '',
    linkedin: '',
    github: ''
  });
  
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Cores do tema
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('blue.100', 'blue.700');
  const hoverBg = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.700', 'white');
  const avatarBorderColor = useColorModeValue('blue.400', 'blue.500');

  // Carregar os dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Obter token e dados básicos do usuário do localStorage
        const token = localStorage.getItem('authToken');
        const user = authService.getCurrentUser();
        
        if (!token || !user) {
          toast({
            title: 'Acesso negado',
            description: 'Você precisa estar logado para ver esta página',
            status: 'error',
            duration: 3000,
            isClosable: true,
            position: 'top',
            variant: 'solid'
          });
          navigate('/login');
          return;
        }

        // Tentar buscar o perfil do usuário da API
        try {
          const response = await api.get('/auth/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Se o perfil existe, use esses dados
          if (response.data) {
            setUserData({
              nickname: response.data.nickname || user.username || 'Usuário',
              email: user.email || '',
              username: response.data.username || '',
              bio: response.data.bio || '',
              location: response.data.location || '',
              university: response.data.university || '',
              degree: response.data.degree || '',
              gradYear: response.data.grad_year || '',
              linkedin: response.data.linkedin || '',
              github: response.data.github || ''
            });
          }
        } catch (error) {
          console.log('Perfil não encontrado, usando dados básicos do usuário');
          // Se não conseguir obter o perfil, usar dados básicos do usuário
          setUserData({
            nickname: user.username || 'Usuário',
            email: user.email || '',
            username: '',
            bio: '',
            location: '',
            university: '',
            degree: '',
            gradYear: '',
            linkedin: '',
            github: ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados do perfil',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          variant: 'solid'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [toast, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSaveProfile = async () => {
    try {
      // Validar se o nickname está preenchido
      if (!userData.nickname.trim()) {
        toast({
          title: 'Nickname obrigatório',
          description: 'Por favor, informe um nickname',
          status: 'error',
          duration: 3000,
          isClosable: true,
          position: 'top',
          variant: 'solid'
        });
        return;
      }

      setIsLoading(true);
      const token = localStorage.getItem('authToken');

      // Preparar dados para atualização
      const profileData = {
        nickname: userData.nickname,
        username: userData.username,
        bio: userData.bio,
        location: userData.location,
        university: userData.university,
        degree: userData.degree,
        grad_year: userData.gradYear,
        linkedin: userData.linkedin,
        github: userData.github,
        // Adicionar imagem de perfil se houver
        profile_image: userData.profile_image
      };

      // Enviar atualização para a API
      const response = await api.post('/auth/users/profile', profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Atualizar o usuário no localStorage para que a navbar possa acessar
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          profile_image: response.data.profile_image
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Opcionalmente, atualizar o estado global (se você estiver usando context)
        // userContext.setUser(updatedUser);
      }

      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'solid'
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar seu perfil',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
        variant: 'solid'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={20}>
        <Center flexDirection="column" h="60vh">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text mt={6} fontSize="lg" fontWeight="medium">Carregando seu perfil...</Text>
          <Text mt={2} color={textColor}>Estamos preparando suas informações</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Heading mb={6} size="lg" color={headingColor}>
          Meu Perfil
        </Heading>

        <Grid 
          templateColumns={{ base: '1fr', md: '300px 1fr' }} 
          gap={8}
        >
          <GridItem>
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <VStack 
                spacing={6} 
                align="center" 
                bg={cardBg} 
                p={6} 
                borderRadius="xl" 
                boxShadow="md"
                border="1px"
                borderColor={borderColor}
              >
                <Box position="relative">
                  <Avatar
                    size="2xl"
                    name={userData.nickname}
                    src={userData.profile_image || undefined}
                    border="4px solid"
                    borderColor={avatarBorderColor}
                  />
                  {isEditing && (
                    <Tooltip label="Alterar foto de perfil" placement="top">
                      <IconButton
                        aria-label="Alterar foto"
                        icon={<FaCamera />}
                        isRound
                        size="sm"
                        colorScheme="blue"
                        position="absolute"
                        bottom="0"
                        right="0"
                        onClick={onOpen}
                        _hover={{ transform: "scale(1.1)" }}
                        transition="all 0.2s"
                      />
                    </Tooltip>
                  )}
                </Box>

                <Box textAlign="center" w="full">
                  <Heading size="md" mb={1}>{userData.nickname}</Heading>
                  {userData.username && (
                    <Text color={textColor} fontSize="sm" mb={2}>
                      {userData.username}
                    </Text>
                  )}
                  <Text color={textColor} fontSize="sm">
                    <FaEnvelope style={{ display: 'inline', marginRight: '5px' }} />
                    {userData.email}
                  </Text>
                </Box>

                {userData.location && (
                  <HStack w="full" justify="center">
                    <Tag size="md" variant="subtle" colorScheme="blue">
                      <TagLeftIcon as={FaMapMarkerAlt} />
                      <TagLabel>{userData.location}</TagLabel>
                    </Tag>
                  </HStack>
                )}

                {userData.university && (
                  <VStack spacing={2} align="center" w="full" bg={hoverBg} p={3} borderRadius="md">
                    <HStack>
                      <FaUniversity color="#4299E1" />
                      <Text fontSize="sm" fontWeight="medium">{userData.university}</Text>
                    </HStack>
                    {userData.degree && (
                      <HStack>
                        <FaGraduationCap color="#4299E1" />
                        <Text fontSize="sm">
                          {userData.degree}
                          {userData.gradYear && `, ${userData.gradYear}`}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                )}

                <HStack spacing={4} mt={2} justify="center">
                  {userData.linkedin && (
                    <Tooltip label={`LinkedIn: ${userData.linkedin}`} placement="top">
                      <IconButton
                        as="a"
                        href={`https://linkedin.com/in/${userData.linkedin}`}
                        target="_blank"
                        aria-label="LinkedIn"
                        icon={<FaLinkedin />}
                        isRound
                        size="md"
                        colorScheme="linkedin"
                        _hover={{ transform: "scale(1.1)" }}
                        transition="all 0.2s"
                      />
                    </Tooltip>
                  )}
                  {userData.github && (
                    <Tooltip label={`GitHub: ${userData.github}`} placement="top">
                      <IconButton
                        as="a"
                        href={`https://github.com/${userData.github}`}
                        target="_blank"
                        aria-label="GitHub"
                        icon={<FaGithub />}
                        isRound
                        size="md"
                        colorScheme="gray"
                        _hover={{ transform: "scale(1.1)" }}
                        transition="all 0.2s"
                      />
                    </Tooltip>
                  )}
                </HStack>

                {!isEditing ? (
                  <Button 
                    colorScheme="blue" 
                    leftIcon={<FaEdit />}
                    onClick={() => setIsEditing(true)}
                    w="full"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    Editar Perfil
                  </Button>
                ) : (
                  <Button 
                    colorScheme="green" 
                    leftIcon={<FaSave />}
                    onClick={handleSaveProfile}
                    w="full"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                    isLoading={isLoading}
                  >
                    Salvar Alterações
                  </Button>
                )}

                {isEditing && (
                  <Button 
                    variant="outline" 
                    colorScheme="red"
                    onClick={() => setIsEditing(false)}
                    w="full"
                  >
                    Cancelar
                  </Button>
                )}
              </VStack>

              {userData.bio && !isEditing && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  mt={6}
                  bg={cardBg}
                  p={5}
                  borderRadius="xl"
                  boxShadow="md"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="sm" mb={3} color={headingColor}>
                    <HStack>
                      <FaInfoCircle />
                      <Text>Sobre mim</Text>
                    </HStack>
                  </Heading>
                  <Text fontSize="sm" color={textColor} whiteSpace="pre-wrap">
                    {userData.bio}
                  </Text>
                </MotionBox>
              )}
            </MotionBox>
          </GridItem>

          <GridItem>
            <MotionBox
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box 
                bg={cardBg} 
                p={6} 
                borderRadius="xl" 
                boxShadow="md"
                border="1px"
                borderColor={borderColor}
              >
                <Tabs 
                  colorScheme="blue" 
                  variant="enclosed"
                  isFitted
                  isLazy
                >
                  <TabList mb={5}>
                    <Tab _selected={{ color: 'blue.600', borderColor: 'blue.500', borderBottomColor: 'transparent', fontWeight: 'bold' }}>
                      <HStack spacing={2}>
                        <FaUser />
                        <Text>Informações</Text>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: 'blue.600', borderColor: 'blue.500', borderBottomColor: 'transparent', fontWeight: 'bold' }}>
                      <HStack spacing={2}>
                        <FaCog />
                        <Text>Segurança</Text>
                      </HStack>
                    </Tab>
                    <Tab _selected={{ color: 'blue.600', borderColor: 'blue.500', borderBottomColor: 'transparent', fontWeight: 'bold' }}>
                      <HStack spacing={2}>
                        <FaBell />
                        <Text>Notificações</Text>
                      </HStack>
                    </Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel p={0}>
                      <VStack spacing={6} align="stretch">
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          spacing={4}
                          align="start"
                          bg={hoverBg}
                          p={4}
                          borderRadius="lg"
                        >
                          <Box flexShrink={0}>
                            <Icon as={FaIdCard} boxSize={8} color="blue.500" />
                          </Box>
                          <Box>
                            <Heading size="md" mb={1} color={headingColor}>Informações Pessoais</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Seus dados principais que serão exibidos no seu perfil público.
                            </Text>
                          </Box>
                        </Stack>
                        
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mt={3}>
                          <FormControl isRequired>
                            <FormLabel fontWeight="medium">
                              Nickname <Text as="span" color="red.500">*</Text>
                            </FormLabel>
                            <Input 
                              name="nickname"
                              value={userData.nickname}
                              onChange={handleInputChange}
                              isReadOnly={!isEditing}
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                              _readOnly={{ cursor: 'default' }}
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontWeight="medium">Nome completo</FormLabel>
                            <Input 
                              name="username"
                              value={userData.username}
                              onChange={handleInputChange}
                              isReadOnly={!isEditing}
                              placeholder="Seu nome completo (opcional)"
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                              _readOnly={{ cursor: 'default' }}
                            />
                          </FormControl>
                        </Grid>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">Email</FormLabel>
                          <Input 
                            name="email"
                            type="email"
                            value={userData.email}
                            isReadOnly={true}
                            bg="gray.50"
                            _readOnly={{ cursor: 'default' }}
                          />
                          <Text fontSize="xs" color={textColor} mt={1}>
                            Para alterar seu email, acesse a aba de segurança.
                          </Text>
                        </FormControl>
                          
                        <FormControl>
                          <FormLabel fontWeight="medium">Biografia</FormLabel>
                          <Textarea 
                            name="bio"
                            value={userData.bio}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            rows={4}
                            placeholder="Conte um pouco sobre você, sua formação e interesses..."
                            bg={isEditing ? 'white' : 'gray.50'}
                            _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                            borderColor={isEditing ? 'gray.300' : 'transparent'}
                            _readOnly={{ cursor: 'default' }}
                            resize={isEditing ? 'vertical' : 'none'}
                          />
                        </FormControl>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">Localização</FormLabel>
                          <Input 
                            name="location"
                            value={userData.location}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            placeholder="Ex: São Paulo, SP"
                            bg={isEditing ? 'white' : 'gray.50'}
                            _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                            borderColor={isEditing ? 'gray.300' : 'transparent'}
                            _readOnly={{ cursor: 'default' }}
                          />
                        </FormControl>
                        
                        <Divider my={5} />
                        
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          spacing={4}
                          align="start"
                          bg={hoverBg}
                          p={4}
                          borderRadius="lg"
                        >
                          <Box flexShrink={0}>
                            <Icon as={FaBookReader} boxSize={8} color="blue.500" />
                          </Box>
                          <Box>
                            <Heading size="md" mb={1} color={headingColor}>Informações Acadêmicas</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Detalhes sobre sua formação acadêmica e qualificações.
                            </Text>
                          </Box>
                        </Stack>
                        
                        <FormControl>
                          <FormLabel fontWeight="medium">Universidade/Instituição</FormLabel>
                          <Input 
                            name="university"
                            value={userData.university}
                            onChange={handleInputChange}
                            isReadOnly={!isEditing}
                            placeholder="Nome da instituição de ensino"
                            bg={isEditing ? 'white' : 'gray.50'}
                            _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                            borderColor={isEditing ? 'gray.300' : 'transparent'}
                            _readOnly={{ cursor: 'default' }}
                          />
                        </FormControl>
                        
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <FormControl>
                            <FormLabel fontWeight="medium">Curso</FormLabel>
                            <Input 
                              name="degree"
                              value={userData.degree}
                              onChange={handleInputChange}
                              isReadOnly={!isEditing}
                              placeholder="Nome do seu curso"
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                              _readOnly={{ cursor: 'default' }}
                            />
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontWeight="medium">Ano de graduação</FormLabel>
                            <Select 
                              name="gradYear"
                              value={userData.gradYear}
                              onChange={handleInputChange}
                              isDisabled={!isEditing}
                              placeholder="Selecione o ano"
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                            >
                              {Array.from({ length: 10 }, (_, i) => 2023 + i).map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        <Divider my={5} />
                        
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          spacing={4}
                          align="start"
                          bg={hoverBg}
                          p={4}
                          borderRadius="lg"
                        >
                          <Box flexShrink={0}>
                            <HStack spacing={2}>
                              <FaLinkedin color="#0077B5" />
                              <FaGithub color="#333333" />
                            </HStack>
                          </Box>
                          <Box>
                            <Heading size="md" mb={1} color={headingColor}>Redes Sociais</Heading>
                            <Text fontSize="sm" color={textColor}>
                              Seus perfis em plataformas profissionais e de desenvolvimento.
                            </Text>
                          </Box>
                        </Stack>
                        
                        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                          <FormControl>
                            <FormLabel fontWeight="medium">LinkedIn</FormLabel>
                            <Input 
                              name="linkedin"
                              value={userData.linkedin}
                              onChange={handleInputChange}
                              isReadOnly={!isEditing}
                              placeholder="seu-username"
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                              _readOnly={{ cursor: 'default' }}
                            />
                            <Text fontSize="xs" color={textColor} mt={1}>
                              Apenas o nome de usuário, sem a URL completa
                            </Text>
                          </FormControl>
                          
                          <FormControl>
                            <FormLabel fontWeight="medium">GitHub</FormLabel>
                            <Input 
                              name="github"
                              value={userData.github}
                              onChange={handleInputChange}
                              isReadOnly={!isEditing}
                              placeholder="seu-username"
                              bg={isEditing ? 'white' : 'gray.50'}
                              _hover={isEditing ? { borderColor: 'blue.300' } : {}}
                              borderColor={isEditing ? 'gray.300' : 'transparent'}
                              _readOnly={{ cursor: 'default' }}
                            />
                            <Text fontSize="xs" color={textColor} mt={1}>
                              Apenas o nome de usuário, sem a URL completa
                            </Text>
                          </FormControl>
                        </Grid>
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Box p={5} bg={hoverBg} borderRadius="lg">
                          <Heading size="md" mb={3} color={headingColor}>Segurança da Conta</Heading>
                          <Text color={textColor}>As configurações de segurança serão implementadas em breve.</Text>
                          
                          <Image 
                            src="https://img.icons8.com/fluency/96/security-lock.png"
                            alt="Segurança"
                            boxSize="100px"
                            mx="auto"
                            my={6}
                            opacity={0.8}
                          />
                          
                          <Text fontSize="sm" textAlign="center">
                            Aqui você poderá alterar sua senha e configurar autenticação em dois fatores.
                          </Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                    
                    <TabPanel>
                      <VStack spacing={6} align="stretch">
                        <Box p={5} bg={hoverBg} borderRadius="lg">
                          <Heading size="md" mb={3} color={headingColor}>Preferências de Notificação</Heading>
                          <Text color={textColor}>As preferências de notificação serão implementadas em breve.</Text>
                          
                          <Image 
                            src="https://img.icons8.com/fluency/96/appointment-reminders.png"
                            alt="Notificações"
                            boxSize="100px"
                            mx="auto"
                            my={6}
                            opacity={0.8}
                          />
                          
                          <Text fontSize="sm" textAlign="center">
                            Aqui você poderá personalizar como deseja receber notificações do sistema.
                          </Text>
                        </Box>
                      </VStack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Box>
            </MotionBox>
          </GridItem>
        </Grid>
      </MotionBox>

      {/* Modal para upload de foto */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Alterar foto de perfil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>Recurso em implementação. Em breve você poderá fazer upload de sua foto de perfil.</Text>
              <Center h="150px">
                <Avatar 
                  size="xl" 
                  name={userData.nickname} 
                  src={userData.profile_image || undefined} 
                />
              </Center>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default UserProfile;