import axios from 'axios';

const API_URL = 'http://localhost:8000';

const dashboardService = {
  getDashboardData: async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.get(`${API_URL}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  },
  
  getMaterialDetails: async (materialId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      const response = await axios.get(`${API_URL}/textos-apoio/${materialId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar detalhes do material ${materialId}:`, error);
      throw error;
    }
  }
};

export default dashboardService;