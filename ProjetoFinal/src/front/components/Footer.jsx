import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Heading,
  Text,
  Link,
  VStack,
  HStack,
  Icon,
  Divider,
  Image,
} from '@chakra-ui/react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/logo(1).svg';

const GLASS_BORDER = 'rgba(255, 255, 255, 0.07)';
const TEXT_MUTED = 'rgba(255,255,255,0.45)';
const TEXT_DEFAULT = 'rgba(255,255,255,0.70)';
const BRAND = '#818CF8';

const Footer = () => {
  return (
    <Box
      as="footer"
      bg="#0d0d0f"
      borderTop="1px solid"
      borderColor={GLASS_BORDER}
    >
      <Container maxW="container.xl" py={12}>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {/* Brand */}
          <VStack align="flex-start" spacing={4}>
            <HStack spacing={2.5}>
              <Image src={logo} alt="EduAI" boxSize="28px" />
              <Text
                fontWeight="800"
                fontSize="lg"
                letterSpacing="-0.03em"
                color="white"
                lineHeight="1"
              >
                Edu<Box as="span" color={BRAND}>AI</Box>
              </Text>
            </HStack>
            <Text color={TEXT_MUTED} fontSize="sm" maxW="240px" lineHeight="1.7">
              Transformando o ensino através da inteligência artificial para educadores brasileiros.
            </Text>
            <HStack spacing={3}>
              <Link href="mailto:arthurpetroli@alunos.utfpr.edu.br" isExternal>
                <Icon as={FaEnvelope} color={TEXT_MUTED} boxSize={4} _hover={{ color: BRAND }} transition="color 0.15s" />
              </Link>
              <Link href="https://github.com" isExternal>
                <Icon as={FaGithub} color={TEXT_MUTED} boxSize={4} _hover={{ color: BRAND }} transition="color 0.15s" />
              </Link>
              <Link href="https://linkedin.com" isExternal>
                <Icon as={FaLinkedin} color={TEXT_MUTED} boxSize={4} _hover={{ color: BRAND }} transition="color 0.15s" />
              </Link>
            </HStack>
          </VStack>

          {/* Navegação */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.08em"
              color={TEXT_MUTED}
              textTransform="uppercase"
            >
              Plataforma
            </Text>
            {[
              { label: 'Início', to: '/' },
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Gerador de Textos', to: '/generate-material' },
              { label: 'Exercícios', to: '/create-exercises' },
              { label: 'Avaliações', to: '/create-assessment' },
              { label: 'Biblioteca', to: '/library' },
            ].map((item) => (
              <Link
                key={item.label}
                as={RouterLink}
                to={item.to}
                fontSize="sm"
                color={TEXT_DEFAULT}
                fontWeight="500"
                _hover={{ color: 'white', textDecoration: 'none' }}
                transition="color 0.15s"
              >
                {item.label}
              </Link>
            ))}
          </VStack>

          {/* Contato */}
          <VStack align="flex-start" spacing={3}>
            <Text
              fontSize="xs"
              fontWeight="700"
              letterSpacing="0.08em"
              color={TEXT_MUTED}
              textTransform="uppercase"
            >
              Contato
            </Text>
            <VStack align="flex-start" spacing={2}>
              <Link
                href="mailto:arthurpetroli@alunos.utfpr.edu.br"
                fontSize="sm"
                color={TEXT_DEFAULT}
                _hover={{ color: BRAND, textDecoration: 'none' }}
                transition="color 0.15s"
              >
                arthurpetroli@alunos.utfpr.edu.br
              </Link>
              <Text fontSize="sm" color={TEXT_MUTED}>(19) 98348-4303</Text>
              <Text fontSize="sm" color={TEXT_MUTED}>R. Marcílio Dias, 635</Text>
            </VStack>

            <Box
              mt={4}
              px={3}
              py={2}
              borderRadius="lg"
              bg="rgba(99,102,241,0.1)"
              border="1px solid rgba(99,102,241,0.2)"
            >
              <Text fontSize="xs" color={BRAND} fontWeight="600">Projeto de TCC — UTFPR</Text>
              <Text fontSize="xs" color={TEXT_MUTED} mt={0.5}>Tecnologia em Sistemas para Internet</Text>
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>

      <Box borderTop="1px solid" borderColor={GLASS_BORDER} py={5}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={2}>
            <Text fontSize="xs" color={TEXT_MUTED}>
              © {new Date().getFullYear()} EduAI. Todos os direitos reservados.
            </Text>
            <Text fontSize="xs" color={TEXT_MUTED}>
              Desenvolvido com IA ·{' '}
              <Link as={RouterLink} to="/sobre" color={TEXT_DEFAULT} _hover={{ color: BRAND }} transition="color 0.15s">
                Sobre o projeto
              </Link>
            </Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
