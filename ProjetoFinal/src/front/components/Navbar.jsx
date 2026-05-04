import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Link,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Image,
  HStack,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import logo from '../assets/logo(1).svg';

const GLASS_BG = 'rgba(10, 10, 11, 0.88)';
const GLASS_BORDER = 'rgba(255, 255, 255, 0.07)';
const TEXT_MUTED = 'rgba(255,255,255,0.55)';
const TEXT_DEFAULT = 'rgba(255,255,255,0.85)';
const TEXT_HOVER = '#ffffff';
const BRAND = '#818CF8';

const Navbar = ({ isLoggedIn, handleLogout, userProfileImage, userData }) => {
  const { isOpen, onToggle } = useDisclosure();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>
    {/* Backdrop overlay quando o menu dropdown está aberto */}
    {dropdownOpen && (
      <Box
        position="fixed"
        inset={0}
        bg="rgba(0,0,0,0.55)"
        backdropFilter="blur(3px)"
        zIndex={99}
        onClick={() => setDropdownOpen(false)}
        transition="opacity 0.2s"
      />
    )}
    <Box
      position="sticky"
      top={0}
      zIndex={100}
      bg={GLASS_BG}
      backdropFilter="blur(20px)"
      borderBottom="1px solid"
      borderColor={GLASS_BORDER}
      style={{ WebkitBackdropFilter: 'blur(20px)' }}
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        px={{ base: 4, md: 8 }}
        h="64px"
        align="center"
        justify="space-between"
      >
        {/* Logo */}
        <RouterLink to="/">
          <HStack spacing={2.5}>
            <Image src={logo} alt="EduAI" boxSize="32px" />
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
        </RouterLink>

        {/* Desktop nav links */}
        <HStack spacing={1} display={{ base: 'none', md: 'flex' }}>
          <DesktopNav isLoggedIn={isLoggedIn} onDropdownChange={setDropdownOpen} />
        </HStack>

        {/* Right side */}
        <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
          {isLoggedIn ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="unstyled"
                cursor="pointer"
                display="flex"
                alignItems="center"
              >
                <Avatar
                  size="sm"
                  src={userProfileImage || undefined}
                  name={userData || 'U'}
                  bg="brand.500"
                  color="white"
                  boxShadow="0 0 12px rgba(99,102,241,0.5)"
                />
              </MenuButton>
              <MenuList
                bg="#18181b"
                border="1px solid"
                borderColor={GLASS_BORDER}
                boxShadow="0 20px 40px rgba(0,0,0,0.5)"
                borderRadius="xl"
                py={2}
              >
                <Box px={4} py={2} borderBottom="1px solid" borderColor={GLASS_BORDER}>
                  <Text color="white" fontWeight="600" fontSize="sm">{userData || 'Professor'}</Text>
                  <Text color={TEXT_MUTED} fontSize="xs">Conta EduAI</Text>
                </Box>
                <MenuItem
                  as={RouterLink} to="/profile"
                  bg="transparent" color={TEXT_DEFAULT} fontSize="sm"
                  _hover={{ bg: 'rgba(99,102,241,0.15)', color: 'white' }}
                >
                  Meu Perfil
                </MenuItem>
                <MenuItem
                  as={RouterLink} to="/dashboard"
                  bg="transparent" color={TEXT_DEFAULT} fontSize="sm"
                  _hover={{ bg: 'rgba(99,102,241,0.15)', color: 'white' }}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  as={RouterLink} to="/library"
                  bg="transparent" color={TEXT_DEFAULT} fontSize="sm"
                  _hover={{ bg: 'rgba(99,102,241,0.15)', color: 'white' }}
                >
                  Meus Materiais
                </MenuItem>
                <MenuDivider borderColor={GLASS_BORDER} />
                <MenuItem
                  onClick={handleLogout}
                  bg="transparent" color="red.400" fontSize="sm"
                  _hover={{ bg: 'rgba(239,68,68,0.1)', color: 'red.300' }}
                >
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <HStack spacing={2}>
              <Button
                as={RouterLink}
                to="/login"
                variant="ghost"
                size="sm"
                color={TEXT_MUTED}
                fontWeight="500"
                _hover={{ color: 'white', bg: 'whiteAlpha.100' }}
              >
                Entrar
              </Button>
              <Button
                as={RouterLink}
                to="/register"
                size="sm"
                bg="brand.500"
                color="white"
                fontWeight="600"
                _hover={{ bg: 'brand.400', boxShadow: '0 0 16px rgba(99,102,241,0.5)' }}
              >
                Começar grátis
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Mobile hamburger */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.100' }}
          aria-label="Toggle Navigation"
        />
      </Flex>

      {/* Mobile menu */}
      <Collapse in={isOpen} animateOpacity>
        <MobileNav isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      </Collapse>
    </Box>
    </>
  );
};

const DesktopNav = ({ isLoggedIn, onDropdownChange }) => {
  return (
    <Stack direction="row" spacing={0} align="center">
      {NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn).map((navItem) => (
        navItem.children ? (
          <Menu
            key={navItem.label}
            onOpen={() => onDropdownChange(true)}
            onClose={() => onDropdownChange(false)}
            placement="bottom-start"
          >
            <MenuButton
              as={Button}
              variant="ghost"
              size="sm"
              px={3}
              fontSize="sm"
              fontWeight="500"
              color={TEXT_MUTED}
              rightIcon={<ChevronDownIcon boxSize={3} />}
              bg="transparent"
              _hover={{ color: TEXT_HOVER, bg: 'rgba(255,255,255,0.06)' }}
              _active={{ bg: 'rgba(255,255,255,0.06)' }}
              _expanded={{ color: TEXT_HOVER }}
            >
              {navItem.label}
            </MenuButton>
            <MenuList
              bg="rgba(18,18,20,0.98)"
              backdropFilter="blur(20px)"
              border="1px solid"
              borderColor={GLASS_BORDER}
              boxShadow="0 24px 48px rgba(0,0,0,0.6)"
              borderRadius="xl"
              p={2}
              minW="240px"
              mt={1}
            >
              {navItem.children.map((child) => (
                <MenuItem
                  key={child.label}
                  as={RouterLink}
                  to={child.href}
                  bg="transparent"
                  borderRadius="lg"
                  px={3}
                  py={3}
                  _hover={{ bg: 'rgba(99,102,241,0.15)' }}
                  onClick={() => onDropdownChange(false)}
                >
                  <Box>
                    <Text fontWeight="600" fontSize="sm" color={TEXT_DEFAULT}>{child.label}</Text>
                    {child.subLabel && (
                      <Text fontSize="xs" color={TEXT_MUTED} mt={0.5}>{child.subLabel}</Text>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        ) : (
          <Link
            key={navItem.label}
            as={RouterLink}
            to={navItem.href ?? '#'}
            px={3}
            py={2}
            fontSize="sm"
            fontWeight="500"
            color={TEXT_MUTED}
            borderRadius="md"
            display="block"
            textDecoration="none"
            transition="all 0.15s"
            _hover={{ color: TEXT_HOVER, bg: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
          >
            {navItem.label}
          </Link>
        )
      ))}
    </Stack>
  );
};

const MobileNav = ({ isLoggedIn, handleLogout }) => {
  const bgColor = '#111113';
  const sairColor = 'rgba(255,255,255,0.6)';

  return (
    <Box
      bg={bgColor}
      px={4}
      py={3}
      borderTop="1px solid"
      borderColor={GLASS_BORDER}
    >
      <Stack spacing={1}>
        {NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn).map((navItem) => (
          <MobileNavItem key={navItem.label} {...navItem} />
        ))}
        {isLoggedIn ? (
          <Box
            py={2}
            px={3}
            borderRadius="lg"
            cursor="pointer"
            onClick={handleLogout}
            color="red.400"
            fontWeight="500"
            fontSize="sm"
            _hover={{ bg: 'rgba(239,68,68,0.1)' }}
            transition="all 0.15s"
          >
            Sair
          </Box>
        ) : (
          <Stack spacing={2} pt={2}>
            <Button as={RouterLink} to="/login" variant="outline" size="sm" color="white" borderColor={GLASS_BORDER}>
              Entrar
            </Button>
            <Button as={RouterLink} to="/register" colorScheme="brand" size="sm">
              Começar grátis
            </Button>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        as={children ? 'div' : RouterLink}
        to={!children ? (href ?? '#') : undefined}
        onClick={children ? onToggle : undefined}
        px={3}
        py={2.5}
        borderRadius="lg"
        justify="space-between"
        align="center"
        cursor="pointer"
        color={TEXT_DEFAULT}
        fontWeight="500"
        fontSize="sm"
        _hover={{ bg: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
        transition="all 0.15s"
      >
        <Text>{label}</Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition="all .2s ease-in-out"
            transform={isOpen ? 'rotate(180deg)' : ''}
            color={TEXT_MUTED}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Stack pl={4} pt={1} spacing={1}>
          {children?.map((child) => (
            <Link
              key={child.label}
              as={RouterLink}
              to={child.href}
              px={3}
              py={2}
              borderRadius="lg"
              fontSize="sm"
              color={TEXT_MUTED}
              fontWeight="500"
              _hover={{ color: 'white', bg: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
              transition="all 0.15s"
            >
              {child.label}
            </Link>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
};

const NAV_ITEMS = [
  { label: 'Início', href: '/' },
  {
    label: 'Recursos',
    href: '#',
    authRequired: true,
    children: [
      { label: 'Gerador de Textos', subLabel: 'Crie textos didáticos personalizados', href: '/generate-material', authRequired: true },
      { label: 'Criador de Exercícios', subLabel: 'Elabore exercícios dinâmicos', href: '/create-exercises', authRequired: true },
      { label: 'Avaliações', subLabel: 'Desenvolva avaliações personalizadas', href: '/create-assessment', authRequired: true },
    ],
  },
  { label: 'Biblioteca', href: '/library', authRequired: true },
  { label: 'Sobre', href: '/sobre' },
];

export default Navbar;
