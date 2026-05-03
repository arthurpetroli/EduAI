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
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Image
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
// Modificar o import do logo
import logo from '../assets/logo(1).svg';

const Navbar = ({ isLoggedIn, handleLogout, userProfileImage, userData }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4, md: 8 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor={useColorModeValue('gray.200', 'gray.900')}
        align={'center'}
        justify={'space-between'}
        width="100%"
      >
        {/* Logo e links de navegação juntos à esquerda */}
        <Flex align="center" flex={1}>
          <RouterLink to="/">
            <Flex align="center" mr={8}>
              {/* Modificar o componente de imagem */}
              <Image src={logo} alt="EduAI Logo" boxSize="40px" mr={2} />
              <Text
                fontFamily={'heading'}
                color={useColorModeValue('gray.800', 'white')}
                fontWeight="bold"
                fontSize="lg"
              >
                EduAI
              </Text>
            </Flex>
          </RouterLink>
          
          {/* Links de navegação ao lado do logo */}
          <Flex display={{ base: 'none', md: 'flex' }}>
            <DesktopNav isLoggedIn={isLoggedIn} />
          </Flex>
        </Flex>

        {/* IconButton para menu mobile */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={onToggle}
          icon={
            isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
          }
          variant={'ghost'}
          aria-label={'Toggle Navigation'}
        />

        {/* Avatar ou botões de login à direita */}
        <Stack
          direction={'row'}
          spacing={6}
          flex="0 0 auto"
        >
          {isLoggedIn ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar
                  size={'sm'}
                  src={userProfileImage || undefined}
                  name={userData || "U"} // Se userData estiver vazio, usar a primeira letra do usuário
                  bg="teal.500" // Cor igual à do seu perfil
                  color="white"
                />
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile">Meu Perfil</MenuItem>
                <MenuItem as={RouterLink} to="/dashboard">Dashboard</MenuItem>
                <MenuItem as={RouterLink} to="/library">Meus Materiais</MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>Sair</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Stack
              direction={'row'}
              spacing={6}
              justify={'flex-end'}
            >
              <Button
                as={RouterLink}
                fontSize={'sm'}
                fontWeight={400}
                variant={'link'}
                to={'/login'}>
                Entrar
              </Button>
              <Button
                as={RouterLink}
                display={{ base: 'none', md: 'inline-flex' }}
                fontSize={'sm'}
                fontWeight={600}
                color={'white'}
                bg={'brand.500'}
                to={'/register'}
                _hover={{
                  bg: 'brand.400',
                }}>
                Cadastrar
              </Button>
            </Stack>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = ({ isLoggedIn }) => {
  const linkColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');
  const popoverContentBgColor = useColorModeValue('white', 'gray.800');

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn).map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={'hover'} placement={'bottom-start'}>
            <PopoverTrigger>
              <Link
                as={RouterLink}
                p={2}
                to={navItem.href ?? '#'}
                fontSize={'sm'}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}>
                {navItem.label}
              </Link>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={'xl'}
                bg={popoverContentBgColor}
                p={4}
                rounded={'xl'}
                minW={'sm'}>
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <Link
      as={RouterLink}
      to={href}
      role={'group'}
      display={'block'}
      p={2}
      rounded={'md'}
      _hover={{ bg: useColorModeValue('brand.50', 'gray.900') }}>
      <Stack direction={'row'} align={'center'}>
        <Box>
          <Text
            transition={'all .3s ease'}
            _groupHover={{ color: 'brand.500' }}
            fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={'sm'}>{subLabel}</Text>
        </Box>
        <Flex
          transition={'all .3s ease'}
          transform={'translateX(-10px)'}
          opacity={0}
          _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
          justify={'flex-end'}
          align={'center'}
          flex={1}>
          <Icon color={'brand.500'} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Link>
  );
};

const MobileNav = ({ isLoggedIn, handleLogout }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const sairColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Stack
      bg={bgColor}
      p={4}
      display={{ md: 'none' }}>
      {NAV_ITEMS.filter(item => !item.authRequired || isLoggedIn).map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      {isLoggedIn && (
        <Box py={2} onClick={handleLogout}>
          <Flex
            align="center"
            p={2}
            fontSize="md"
            fontWeight={500}
            color={sairColor}>
            Sair
          </Flex>
        </Box>
      )}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
        }}>
        <Text
          fontWeight={600}
          color={useColorModeValue('gray.600', 'gray.200')}>
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={'all .25s ease-in-out'}
            transform={isOpen ? 'rotate(180deg)' : ''}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          align={'start'}>
          {children &&
            children.map((child) => (
              <Link
                key={child.label}
                as={RouterLink}
                py={2}
                to={child.href}>
                {child.label}
              </Link>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Início',
    href: '/',
  },
  {
    label: 'Recursos',
    href: '#',
    children: [
      {
        label: 'Gerador de Textos',
        subLabel: 'Crie textos didáticos personalizados',
        href: '/generate-material',
        authRequired: true,
      },
      {
        label: 'Criador de Exercícios',
        subLabel: 'Elabore exercícios dinâmicos',
        href: '/create-exercises',
        authRequired: true,
      },
      {
        label: 'Avaliações',
        subLabel: 'Desenvolva avaliações personalizadas',
        href: '/create-assessment',
        authRequired: true,
      },
    ],
    authRequired: true,
  },
  {
    label: 'Biblioteca de Materiais',
    href: '/library',
    authRequired: true,
  },
  {
    label: 'Sobre',
    href: '/sobre', // Alterado de '/about' para '/sobre'
  },
];

export default Navbar;