import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  HStack,
  VStack,
  Icon,
  Badge,
  Grid,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaRobot,
  FaPencilAlt,
  FaChalkboardTeacher,
  FaFileExport,
  FaBook,
  FaFlask,
  FaGlobe,
  FaCalculator,
  FaPalette,
  FaLandmark,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
} from 'react-icons/fa';

const GLASS_BORDER = 'rgba(255, 255, 255, 0.08)';
const GLASS_BG = 'rgba(255, 255, 255, 0.04)';
const TEXT_MUTED = 'rgba(255,255,255,0.55)';
const TEXT_DEFAULT = 'rgba(255,255,255,0.85)';
const BRAND = '#818CF8';

const GlassCard = ({ children, ...props }) => (
  <Box
    bg={GLASS_BG}
    backdropFilter="blur(16px)"
    border="1px solid"
    borderColor={GLASS_BORDER}
    borderRadius="2xl"
    transition="all 0.25s ease"
    _hover={{
      bg: 'rgba(255,255,255,0.07)',
      borderColor: 'rgba(129,140,248,0.3)',
      transform: 'translateY(-3px)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
    }}
    {...props}
  >
    {children}
  </Box>
);

const Home = () => {
  return (
    <Box>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <Box
        bg="#0a0a0b"
        py={{ base: 20, md: 32 }}
        position="relative"
        overflow="hidden"
      >
        {/* Glow blobs */}
        <Box position="absolute" top="10%" left="5%" w="500px" h="500px"
          bg="rgba(99,102,241,0.12)" borderRadius="full" filter="blur(80px)" zIndex={0} />
        <Box position="absolute" bottom="10%" right="5%" w="400px" h="400px"
          bg="rgba(124,58,237,0.10)" borderRadius="full" filter="blur(80px)" zIndex={0} />

        {/* Dot grid */}
        <Box
          position="absolute" inset={0} zIndex={0} opacity={0.3}
          backgroundImage="radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)"
          backgroundSize="32px 32px"
        />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={0} align="center" textAlign="center" mb={16}>
            <Badge
              bg="rgba(99,102,241,0.15)"
              color={BRAND}
              border="1px solid rgba(99,102,241,0.3)"
              px={4} py={1.5}
              borderRadius="full"
              fontSize="sm"
              fontWeight="600"
              mb={8}
              letterSpacing="0.02em"
            >
              ✦ Plataforma de IA para Professores
            </Badge>

            <Heading
              fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }}
              fontWeight="800"
              letterSpacing="-0.04em"
              lineHeight="1.05"
              color="white"
              maxW="820px"
              mb={6}
            >
              Materiais didáticos
              <Box
                as="span"
                display="block"
                bgGradient="linear(to-r, #818CF8, #A78BFA, #C4B5FD)"
                bgClip="text"
              >
                criados por IA.
              </Box>
            </Heading>

            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color={TEXT_MUTED}
              maxW="560px"
              lineHeight="1.75"
              mb={10}
            >
              Gere textos de apoio, exercícios com gabarito e avaliações completas —
              adaptados ao nível de ensino e à disciplina da sua turma, em segundos.
            </Text>

            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button
                as={RouterLink}
                to="/register"
                size="lg"
                bg="brand.500"
                color="white"
                fontWeight="700"
                px={8}
                _hover={{
                  bg: 'brand.400',
                  boxShadow: '0 0 24px rgba(99,102,241,0.55)',
                  transform: 'translateY(-2px)',
                }}
                rightIcon={<Icon as={FaArrowRight} />}
              >
                Começar gratuitamente
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                variant="outline"
                borderColor={GLASS_BORDER}
                color={TEXT_DEFAULT}
                fontWeight="600"
                px={8}
                _hover={{ bg: GLASS_BG, borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }}
              >
                Já tenho conta
              </Button>
            </HStack>
          </VStack>

          {/* Stats bar */}
          <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
            {[
              { value: '< 1 min', label: 'para gerar um material completo' },
              { value: '9 seções', label: 'estruturadas em cada texto de apoio' },
              { value: '500 RPD', label: 'requisições Gemini por dia' },
              { value: 'PDF + DOCX', label: 'formatos de exportação' },
            ].map((s) => (
              <GlassCard key={s.label} p={5} textAlign="center">
                <Text fontSize="2xl" fontWeight="800" color="white" letterSpacing="-0.03em" mb={1}>
                  {s.value}
                </Text>
                <Text fontSize="xs" color={TEXT_MUTED} lineHeight="1.5">{s.label}</Text>
              </GlassCard>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── COMO FUNCIONA ────────────────────────────────────── */}
      <Box bg="#0d0d0f" py={24} position="relative" overflow="hidden">
        <Box position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"
          w="600px" h="300px" bg="rgba(99,102,241,0.06)" borderRadius="full" filter="blur(60px)" />

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack mb={16} spacing={4} textAlign="center">
            <Badge
              bg="rgba(99,102,241,0.15)" color={BRAND}
              border="1px solid rgba(99,102,241,0.3)"
              px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600"
            >
              Como funciona
            </Badge>
            <Heading color="white" fontSize={{ base: '2xl', md: '4xl' }} letterSpacing="-0.03em">
              Três passos para a aula pronta
            </Heading>
            <Text color={TEXT_MUTED} fontSize="lg" maxW="480px" lineHeight="1.7">
              Do formulário ao material completo em menos de um minuto.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            {[
              {
                step: '01',
                title: 'Escolha disciplina e tópico',
                desc: 'Selecione a matéria, o nível de ensino e descreva o tema que deseja abordar.',
                accent: '#818CF8',
              },
              {
                step: '02',
                title: 'A IA gera o conteúdo',
                desc: 'O Gemini 3.1 Flash Lite cria o material com objetivos de aprendizagem, exemplos, erros comuns e sugestões didáticas.',
                accent: '#A78BFA',
              },
              {
                step: '03',
                title: 'Edite e exporte',
                desc: 'Revise, ajuste e exporte em PDF ou DOCX — pronto para imprimir ou enviar aos alunos.',
                accent: '#C4B5FD',
              },
            ].map((item, i) => (
              <GlassCard key={item.step} p={7}>
                <Box
                  fontSize="xs"
                  fontWeight="800"
                  letterSpacing="0.1em"
                  color={item.accent}
                  mb={4}
                  fontFamily="mono"
                >
                  {item.step}
                </Box>
                <Heading fontSize="lg" color="white" mb={3} letterSpacing="-0.02em">
                  {item.title}
                </Heading>
                <Text color={TEXT_MUTED} fontSize="sm" lineHeight="1.75">
                  {item.desc}
                </Text>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── FUNCIONALIDADES ──────────────────────────────────── */}
      <Box bg="#0a0a0b" py={24}>
        <Container maxW="container.xl">
          <VStack mb={16} spacing={4} textAlign="center">
            <Badge
              bg="rgba(99,102,241,0.15)" color={BRAND}
              border="1px solid rgba(99,102,241,0.3)"
              px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600"
            >
              Funcionalidades
            </Badge>
            <Heading color="white" fontSize={{ base: '2xl', md: '4xl' }} letterSpacing="-0.03em">
              Tudo que o professor precisa
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5}>
            {[
              {
                icon: FaBook,
                title: 'Textos de Apoio',
                desc: 'Material completo com objetivos, fundamentos, exemplos resolvidos, erros comuns e sugestões didáticas — em Markdown estruturado.',
                accent: '#818CF8',
              },
              {
                icon: FaPencilAlt,
                title: 'Listas de Exercícios',
                desc: 'Questões com gabarito comentado, prefixadas por dificuldade [Fácil], [Médio], [Difícil]. Múltipla escolha ou dissertativas.',
                accent: '#34D399',
              },
              {
                icon: FaChalkboardTeacher,
                title: 'Avaliações',
                desc: 'Provas balanceadas com distribuição automática de dificuldade e tipos de questão. Gabarito com critérios de correção.',
                accent: '#A78BFA',
              },
              {
                icon: FaFileExport,
                title: 'Exportação',
                desc: 'Exporte em PDF ou DOCX com formatação profissional, pronto para imprimir ou compartilhar com alunos e coordenação.',
                accent: '#FBBF24',
              },
            ].map((f) => (
              <GlassCard key={f.title} p={6}>
                <Box
                  w="44px" h="44px"
                  bg={`${f.accent}20`}
                  border="1px solid"
                  borderColor={`${f.accent}40`}
                  borderRadius="xl"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  mb={5}
                >
                  <Icon as={f.icon} color={f.accent} boxSize={4} />
                </Box>
                <Heading fontSize="md" color="white" mb={2} letterSpacing="-0.02em">
                  {f.title}
                </Heading>
                <Text color={TEXT_MUTED} fontSize="sm" lineHeight="1.75">
                  {f.desc}
                </Text>
              </GlassCard>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── DISCIPLINAS ──────────────────────────────────────── */}
      <Box bg="#0d0d0f" py={24}>
        <Container maxW="container.xl">
          <VStack mb={12} spacing={4} textAlign="center">
            <Badge
              bg="rgba(99,102,241,0.15)" color={BRAND}
              border="1px solid rgba(99,102,241,0.3)"
              px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600"
            >
              Disciplinas
            </Badge>
            <Heading color="white" fontSize={{ base: '2xl', md: '4xl' }} letterSpacing="-0.03em">
              Suporte para diversas áreas
            </Heading>
            <Text color={TEXT_MUTED} fontSize="lg">
              Prompts otimizados para a didática de cada disciplina.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 2, sm: 4, lg: 8 }} spacing={3}>
            {[
              { name: 'Português', icon: FaBook, accent: '#818CF8' },
              { name: 'Matemática', icon: FaCalculator, accent: '#34D399' },
              { name: 'Física', icon: FaBolt, accent: '#F87171' },
              { name: 'Química', icon: FaFlask, accent: '#A78BFA' },
              { name: 'Biologia', icon: FaGlobe, accent: '#22D3EE' },
              { name: 'História', icon: FaLandmark, accent: '#FBBF24' },
              { name: 'Geografia', icon: FaGlobe, accent: '#2DD4BF' },
              { name: 'Literatura', icon: FaPalette, accent: '#F472B6' },
            ].map((d) => (
              <Box
                key={d.name}
                bg={GLASS_BG}
                border="1px solid"
                borderColor={GLASS_BORDER}
                borderRadius="xl"
                p={4}
                textAlign="center"
                transition="all 0.2s ease"
                _hover={{
                  bg: `${d.accent}15`,
                  borderColor: `${d.accent}50`,
                  transform: 'translateY(-3px)',
                }}
              >
                <Icon as={d.icon} color={d.accent} boxSize={5} mb={2} />
                <Text fontWeight="600" fontSize="xs" color={TEXT_DEFAULT}>{d.name}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* ── BENEFÍCIOS ───────────────────────────────────────── */}
      <Box bg="#0a0a0b" py={24}>
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', lg: 'row' }} align="center" gap={16}>
            <Box flex={1}>
              <Badge
                bg="rgba(99,102,241,0.15)" color={BRAND}
                border="1px solid rgba(99,102,241,0.3)"
                px={3} py={1} borderRadius="full" fontSize="sm" fontWeight="600" mb={6}
              >
                Por que usar o EduAI?
              </Badge>
              <Heading
                color="white"
                fontSize={{ base: '2xl', md: '4xl' }}
                letterSpacing="-0.03em"
                mb={6}
                lineHeight="1.15"
              >
                Economize horas de planejamento toda semana
              </Heading>
              <Text color={TEXT_MUTED} fontSize="lg" mb={8} lineHeight="1.8">
                Professores gastam em média 8 horas semanais preparando materiais.
                Com o EduAI, você foca no que importa: ensinar.
              </Text>
              <VStack align="start" spacing={4}>
                {[
                  'Objetivos de aprendizagem gerados automaticamente',
                  'Gabarito comentado incluído em todos os exercícios',
                  'Sugestões didáticas com tempo estimado por atividade',
                  'Exportação imediata — sem formatação manual',
                ].map((item) => (
                  <HStack key={item} spacing={3} align="start">
                    <Icon as={FaCheckCircle} color={BRAND} boxSize={5} mt={0.5} flexShrink={0} />
                    <Text color={TEXT_DEFAULT} fontSize="sm" lineHeight="1.7">{item}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Box flex={1}>
              <SimpleGrid columns={2} spacing={4}>
                {[
                  { value: '< 1 min', label: 'para gerar um material completo', accent: '#818CF8' },
                  { value: '9 seções', label: 'por texto de apoio gerado', accent: '#34D399' },
                  { value: '3 tentativas', label: 'de retry automático em caso de erro', accent: '#A78BFA' },
                  { value: '100%', label: 'gratuito para professores', accent: '#FBBF24' },
                ].map((s) => (
                  <GlassCard key={s.label} p={6}>
                    <Text
                      fontSize="2xl"
                      fontWeight="800"
                      letterSpacing="-0.04em"
                      color={s.accent}
                      mb={1}
                      style={{ textShadow: `0 0 20px ${s.accent}60` }}
                    >
                      {s.value}
                    </Text>
                    <Text fontSize="xs" color={TEXT_MUTED} lineHeight="1.5">{s.label}</Text>
                  </GlassCard>
                ))}
              </SimpleGrid>
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <Box bg="#0d0d0f" py={24} position="relative" overflow="hidden">
        <Box
          position="absolute" top="50%" left="50%" transform="translate(-50%,-50%)"
          w="500px" h="300px"
          bg="rgba(99,102,241,0.1)"
          borderRadius="full"
          filter="blur(60px)"
        />

        <Container maxW="container.md" textAlign="center" position="relative" zIndex={1}>
          <Heading
            color="white"
            fontSize={{ base: '2xl', md: '4xl' }}
            letterSpacing="-0.03em"
            mb={4}
            lineHeight="1.2"
          >
            Pronto para transformar sua{' '}
            <Box
              as="span"
              bgGradient="linear(to-r, #818CF8, #A78BFA)"
              bgClip="text"
            >
              prática pedagógica?
            </Box>
          </Heading>
          <Text color={TEXT_MUTED} fontSize="lg" mb={10} lineHeight="1.7">
            Crie materiais didáticos de qualidade em segundos. Sem custo, sem complicação.
          </Text>
          <HStack justify="center" spacing={4} flexWrap="wrap">
            <Button
              as={RouterLink}
              to="/register"
              size="lg"
              bg="brand.500"
              color="white"
              fontWeight="700"
              px={8}
              _hover={{
                bg: 'brand.400',
                boxShadow: '0 0 28px rgba(99,102,241,0.55)',
                transform: 'translateY(-2px)',
              }}
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Criar conta gratuita
            </Button>
            <Button
              as={RouterLink}
              to="/sobre"
              size="lg"
              variant="outline"
              borderColor={GLASS_BORDER}
              color={TEXT_DEFAULT}
              fontWeight="600"
              px={8}
              _hover={{ bg: GLASS_BG, borderColor: 'rgba(255,255,255,0.2)', transform: 'translateY(-2px)' }}
            >
              Saiba mais
            </Button>
          </HStack>
        </Container>
      </Box>

    </Box>
  );
};

export default Home;
