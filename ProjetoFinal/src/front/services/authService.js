import axios from 'axios';

const API_URL = 'http://localhost:8000';

const authService = {
  login: async (username, password) => {
    try {
      // Usar URLSearchParams para OAuth2PasswordRequestForm
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);
      
      const response = await axios.post(`${API_URL}/auth/token`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      
      // Armazenar token no localStorage
      const token = response.data.access_token;
      localStorage.setItem('authToken', token);
      
      // Buscar dados do usuário
      const userResponse = await axios.get(`${API_URL}/auth/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Armazenar dados do usuário
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      return userResponse.data;
    } catch (error) {
      console.error('Erro de login:', error);
      // Limpar dados em caso de erro
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      throw error;
    }
  },
  
  register: async (username, password) => {
    try {
      // Enviar requisição de registro
      const response = await axios.post(`${API_URL}/auth/users/register`, {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // Não redirecionar automaticamente aqui, deixe o componente cuidar disso
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }
};

export default authService;