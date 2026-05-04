import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Flex,
  Icon,
  Spinner,
  Center,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Badge,
  HStack,
  VStack,
  Grid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaFileAlt,
  FaClipboardList,
  FaChartBar,
  FaPlus,
  FaRegCalendarAlt,
  FaBook,
  FaFileExport,
  FaSync,
  FaArrowRight,
} from 'react-icons/fa';
import dashboardService from '../services/dashboardService';
import ReactMarkdown from 'react-markdown';

const GLASS_BORDER = 'rgba(255, 255, 255, 0.08)';
const GLASS_BG = 'rgba(255, 255, 255, 0.04)';
const TEXT_MUTED = 'rgba(255,255,255,0.50)';
const TEXT_DEFAULT = 'rgba(255,255,255,0.80)';
const BRAND = '#818CF8';

const GlassCard = ({ children, hover = true, ...props }) => (
  <Box
    bg={GLASS_BG}
    backdropFilter="blur(16px)"
    border="1px solid"
    borderColor={GLASS_BORDER}
    borderRadius="2xl"
    transition="all 0.25s ease"
    {...(hover && {
      _hover: {
        bg: 'rgba(255,255,255,0.07)',
        borderColor: 'rgba(129,140,248,0.3)',
        transform: 'translateY(-2px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
      },
    })}
    {...props}
  >
    {children}
  </Box>
);

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const getUsername = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.username || 'Professor';
  } catch {
    return 'Professor';
  }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const toast = useToast();

  const fetchDashboardData = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const data = await dashboardService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      if (err.response && err.response.status !== 401) {
        setError('Não foi possível carregar os dados.');
        toast({ title: 'Erro ao atualizar', status: 'error', duration: 3000, isClosable: true });
        setDashboardData({ materiaisCriados: 0, exercicios: 0, avaliacoes: 0, exportacoes: 0, materiaisRecentes: [] });
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleViewMaterial = async (material) => {
    try {
      if (material.content) { setSelectedMaterial(material); setIsOpenModal(true); return; }
      const data = await dashboardService.getMaterialDetails(material.id);
      setSelectedMaterial({ ...material, content: data.conteudo });
      setIsOpenModal(true);
    } catch {
      toast({ title: 'Erro', description: 'Não foi possível carregar o material', status: 'error', duration: 3000, isClosable: true });
    }
  };

  if (isLoading) {
    return (
      <Box bg="#0a0a0b" minH="100vh">
        <Center h="100vh" flexDirection="column" gap={4}>
          <Spinner size="xl" color={BRAND} thickness="3px" />
          <Text color={TEXT_MUTED} fontSize="sm">Carregando seu dashboard...</Text>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="#0a0a0b" minH="100vh" pb={16}>

      {/* Header */}
      <Box
        bg="#0d0d0f"
        borderBottom="1px solid"
        borderColor={GLASS_BORDER}
        py={10}
        position="relative"
        overflow="hidden"
      >
        <Box position="absolute" top="-60px" right="5%" w="300px" h="300px"
          bg="rgba(99,102,241,0.08)" borderRadius="full" filter="blur(60px)" />
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
            <Box>
              <Text fontSize="sm" color={TEXT_MUTED} mb={1} fontWeight="500">{getGreeting()},</Text>
              <Heading
                color="white"
                fontSize={{ base: '2xl', md: '3xl' }}
                fontWeight="800"
                letterSpacing="-0.03em"
                lineHeight="1"
              >
                {getUsername()} 👋
              </Heading>
              <Text color={TEXT_MUTED} mt={2} fontSize="sm">
                Gerencie seus materiais e crie novos conteúdos didáticos
              </Text>
            </Box>
            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={FaSync} />}
                onClick={() => fetchDashboardData(true)}
                isLoading={isRefreshing}
                loadingText="Atualizando"
                variant="outline"
                borderColor={GLASS_BORDER}
                color={TEXT_DEFAULT}
                _hover={{ bg: GLASS_BG, borderColor: 'rgba(255,255,255,0.15)' }}
                size="sm"
              >
                Atualizar
              </Button>
              <Button
                as={RouterLink}
                to="/generate-material"
                leftIcon={<Icon as={FaPlus} />}
                bg="brand.500"
                color="white"
                fontWeight="700"
                size="sm"
                _hover={{ bg: 'brand.400', boxShadow: `0 0 20px rgba(99,102,241,0.45)` }}
              >
                Novo Material
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" pt={8}>

        {/* Stats */}
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4} mb={8}>
          {[
            { icon: FaFileAlt, label: 'Materiais', value: dashboardData?.materiaisCriados || 0, sub: 'Textos de apoio', accent: '#818CF8' },
            { icon: FaClipboardList, label: 'Exercícios', value: dashboardData?.exercicios || 0, sub: 'Listas criadas', accent: '#34D399' },
            { icon: FaChartBar, label: 'Avaliações', value: dashboardData?.avaliacoes || 0, sub: 'Provas montadas', accent: '#A78BFA' },
            { icon: FaFileExport, label: 'Exportações', value: dashboardData?.exportacoes || 0, sub: 'Docs exportados', accent: '#FBBF24' },
          ].map((s) => (
            <GlassCard key={s.label} p={5} hover={false}>
              <Flex justify="space-between" align="flex-start" mb={4}>
                <Box
                  w="36px" h="36px"
                  bg={`${s.accent}18`}
                  border="1px solid"
                  borderColor={`${s.accent}35`}
                  borderRadius="lg"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon as={s.icon} color={s.accent} boxSize={4} />
                </Box>
              </Flex>
              <Text
                fontSize="3xl"
                fontWeight="800"
                color="white"
                letterSpacing="-0.04em"
                lineHeight="1"
                style={{ textShadow: `0 0 20px ${s.accent}50` }}
              >
                {s.value}
              </Text>
              <Text fontWeight="600" fontSize="sm" color={TEXT_DEFAULT} mt={1}>{s.label}</Text>
              <Text fontSize="xs" color={TEXT_MUTED} mt={0.5}>{s.sub}</Text>
            </GlassCard>
          ))}
        </Grid>

        {/* Quick Actions */}
        <Box mb={8}>
          <Text
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.08em"
            color={TEXT_MUTED}
            textTransform="uppercase"
            mb={4}
          >
            Criar novo conteúdo
          </Text>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            {[
              { title: 'Texto de Apoio', desc: 'Material com 9 seções e sugestões didáticas', icon: FaFileAlt, link: '/generate-material', accent: '#818CF8' },
              { title: 'Lista de Exercícios', desc: 'Questões com gabarito comentado por dificuldade', icon: FaClipboardList, link: '/create-exercises', accent: '#34D399' },
              { title: 'Avaliação', desc: 'Prova balanceada com múltipla escolha e dissertativas', icon: FaChartBar, link: '/create-assessment', accent: '#A78BFA' },
              { title: 'Minha Biblioteca', desc: 'Todos os materiais salvos', icon: FaBook, link: '/library', accent: '#FBBF24' },
            ].map((a) => (
              <Box
                key={a.title}
                as={RouterLink}
                to={a.link}
                bg={GLASS_BG}
                border="1px solid"
                borderColor={GLASS_BORDER}
                borderRadius="2xl"
                p={5}
                transition="all 0.25s ease"
                _hover={{
                  bg: `${a.accent}10`,
                  borderColor: `${a.accent}40`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 16px 40px rgba(0,0,0,0.3)`,
                  textDecoration: 'none',
                }}
                display="block"
              >
                <Box
                  w="40px" h="40px"
                  bg={`${a.accent}18`}
                  border="1px solid"
                  borderColor={`${a.accent}35`}
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={4}
                >
                  <Icon as={a.icon} color={a.accent} boxSize={4} />
                </Box>
                <Text fontWeight="700" fontSize="sm" color="white" mb={1}>{a.title}</Text>
                <Text fontSize="xs" color={TEXT_MUTED} lineHeight="1.6">{a.desc}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Recent Materials */}
        <Box>
          <Flex justify="space-between" align="center" mb={4}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.08em"
              color={TEXT_MUTED}
              textTransform="uppercase"
            >
              Materiais Recentes
            </Text>
            <Button
              as={RouterLink}
              to="/library"
              variant="ghost"
              size="sm"
              color={TEXT_MUTED}
              fontWeight="500"
              _hover={{ color: BRAND, bg: 'transparent' }}
              rightIcon={<Icon as={FaArrowRight} boxSize={3} />}
            >
              Ver todos
            </Button>
          </Flex>

          {dashboardData?.materiaisRecentes && dashboardData.materiaisRecentes.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {dashboardData.materiaisRecentes.map((material, index) => (
                <RecentMaterialCard
                  key={material.id || index}
                  title={material.title}
                  type={material.type}
                  date={material.date}
                  discipline={material.discipline || '—'}
                  id={material.id}
                  onView={() => handleViewMaterial(material)}
                />
              ))}
            </SimpleGrid>
          ) : (
            <GlassCard p={12} textAlign="center" hover={false}>
              <Icon as={FaFileAlt} boxSize={10} color={TEXT_MUTED} mb={4} />
              <Heading size="sm" color={TEXT_DEFAULT} mb={2}>Nenhum material ainda</Heading>
              <Text color={TEXT_MUTED} fontSize="sm" mb={5}>
                Crie seu primeiro material didático usando a IA.
              </Text>
              <Button
                as={RouterLink}
                to="/generate-material"
                bg="brand.500"
                color="white"
                size="sm"
                leftIcon={<Icon as={FaPlus} />}
                _hover={{ bg: 'brand.400', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
              >
                Criar primeiro material
              </Button>
            </GlassCard>
          )}
        </Box>
      </Container>

      {/* Modal de visualização */}
      <Modal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="rgba(0,0,0,0.8)" backdropFilter="blur(8px)" />
        <ModalContent
          maxW="800px"
          bg="#111113"
          border="1px solid"
          borderColor={GLASS_BORDER}
          borderRadius="2xl"
          color="white"
        >
          <ModalHeader
            borderBottom="1px solid"
            borderColor={GLASS_BORDER}
            py={4}
            fontSize="md"
            fontWeight="700"
            color="white"
            letterSpacing="-0.02em"
          >
            {selectedMaterial?.title}
          </ModalHeader>
          <ModalCloseButton color={TEXT_MUTED} _hover={{ color: 'white' }} />
          <ModalBody py={6}>
            <Box
              p={5}
              borderRadius="xl"
              bg="rgba(255,255,255,0.03)"
              border="1px solid"
              borderColor={GLASS_BORDER}
              sx={{
                'h1,h2,h3,h4': { fontWeight: '700', mb: 3, mt: 5, color: 'white', letterSpacing: '-0.02em' },
                'p': { mb: 3, lineHeight: '1.75', color: TEXT_DEFAULT },
                'ul,ol': { pl: 6, mb: 3 },
                'li': { mb: 2, lineHeight: '1.65', color: TEXT_DEFAULT },
                'strong': { fontWeight: '700', color: 'white' },
                'em': { color: BRAND },
                'code': { bg: 'rgba(99,102,241,0.15)', color: BRAND, px: 1.5, py: 0.5, borderRadius: 'md', fontSize: 'sm' },
              }}
            >
              {selectedMaterial?.content ? (
                <ReactMarkdown>{selectedMaterial.content}</ReactMarkdown>
              ) : (
                <Center py={8}><Spinner color={BRAND} /></Center>
              )}
            </Box>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor={GLASS_BORDER} gap={3}>
            <Button
              variant="outline"
              borderColor={GLASS_BORDER}
              color={TEXT_DEFAULT}
              _hover={{ bg: GLASS_BG }}
              onClick={() => setIsOpenModal(false)}
            >
              Fechar
            </Button>
            <Button
              as={RouterLink}
              to={`/generate-material?id=${selectedMaterial?.id}`}
              bg="brand.500"
              color="white"
              _hover={{ bg: 'brand.400', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Editar material
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const typeConfig = {
  material: { label: 'Material Didático', accent: '#818CF8' },
  exercise: { label: 'Exercícios', accent: '#34D399' },
  assessment: { label: 'Avaliação', accent: '#FBBF24' },
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const RecentMaterialCard = ({ title, type, date, discipline, id, onView }) => {
  const cfg = typeConfig[type] || { label: type, accent: '#818CF8' };
  const GLASS_BORDER_LOCAL = 'rgba(255,255,255,0.08)';
  const GLASS_BG_LOCAL = 'rgba(255,255,255,0.04)';

  return (
    <Box
      bg={GLASS_BG_LOCAL}
      border="1px solid"
      borderColor={GLASS_BORDER_LOCAL}
      borderRadius="2xl"
      overflow="hidden"
      transition="all 0.25s ease"
      _hover={{
        bg: 'rgba(255,255,255,0.06)',
        borderColor: `${cfg.accent}40`,
        transform: 'translateY(-2px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
      }}
    >
      <Box
        borderBottom="1px solid"
        borderColor={GLASS_BORDER_LOCAL}
        px={5}
        pt={4}
        pb={3}
      >
        <Box
          display="inline-block"
          bg={`${cfg.accent}18`}
          border="1px solid"
          borderColor={`${cfg.accent}35`}
          borderRadius="full"
          px={2.5}
          py={0.5}
          mb={2}
        >
          <Text fontSize="xs" fontWeight="600" color={cfg.accent}>{cfg.label}</Text>
        </Box>
        <Text fontWeight="700" fontSize="sm" color="white" noOfLines={2} lineHeight="1.4">
          {title}
        </Text>
      </Box>
      <Box px={5} py={3}>
        <Text fontSize="xs" color="rgba(255,255,255,0.45)" mb={1}>
          Disciplina: <Box as="span" color="rgba(255,255,255,0.70)" fontWeight="500">{discipline}</Box>
        </Text>
        <Flex align="center" gap={1.5}>
          <Icon as={FaRegCalendarAlt} color="rgba(255,255,255,0.35)" boxSize={3} />
          <Text fontSize="xs" color="rgba(255,255,255,0.40)">{formatDate(date)}</Text>
        </Flex>
      </Box>
      <Flex
        borderTop="1px solid"
        borderColor={GLASS_BORDER_LOCAL}
        px={5}
        py={3}
        gap={2}
      >
        <Button
          size="xs"
          variant="ghost"
          color="rgba(255,255,255,0.60)"
          _hover={{ bg: 'rgba(255,255,255,0.08)', color: 'white' }}
          onClick={onView}
          flex={1}
          fontWeight="600"
        >
          Visualizar
        </Button>
        <Button
          size="xs"
          as={RouterLink}
          to={`/generate-material?id=${id}`}
          bg="brand.500"
          color="white"
          flex={1}
          fontWeight="600"
          _hover={{ bg: 'brand.400' }}
        >
          Editar
        </Button>
      </Flex>
    </Box>
  );
};

export default Dashboard;
