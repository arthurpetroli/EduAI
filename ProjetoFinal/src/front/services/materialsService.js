import axios from 'axios';

const API_URL = 'http://localhost:8000';

const materialsService = {
  // Buscar todos os materiais do usuário
  getAllMaterials: async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Buscar textos de apoio
      const textsResponse = await axios.get(`${API_URL}/materiais`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Resposta de textos:', textsResponse.data.length, 'itens');
      
      // Buscar listas de exercícios
      const exercisesResponse = await axios.get(`${API_URL}/listas-exercicios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        console.error('Erro ao buscar listas de exercícios:', error);
        return { data: [] };
      });
      
      console.log('Resposta de exercícios:', exercisesResponse.data.length, 'itens');
      
      // Buscar avaliações
      const assessmentsResponse = await axios.get(`${API_URL}/avaliacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(error => {
        console.error('Erro ao buscar avaliações:', error);
        return { data: [] };
      });
      
      console.log('Resposta de avaliações:', assessmentsResponse.data.length, 'itens');
      
      // Mapear textos para o formato esperado pela interface
      const materialItems = textsResponse.data.map(item => ({
        id: item.id,
        title: item.tema,
        type: 'material',
        discipline: item.materia || 'Geral',
        gradeLevel: item.nivel || 'Não especificado',
        createdAt: item.data_criacao,
        updatedAt: item.data_criacao,
        tags: item.tags || [],
        favorite: false,
        description: item.conteudo ? item.conteudo.substring(0, 100) + '...' : '',
        content: item.conteudo
      }));
      
      // Mapear listas de exercícios
      const exerciseItems = exercisesResponse.data.map(item => ({
        id: item.id,
        title: item.titulo,
        description: `Lista com ${item.exercicios?.length || 0} exercícios`,
        type: 'exercise',
        discipline: item.materia || item.titulo?.split(':')[0]?.replace('Exercícios de ', '') || 'Não especificado',
        gradeLevel: item.nivel_dificuldade || 'Não especificado',
        date: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        favorite: item.favorite || false
      }));
      
      // Mapear avaliações
      const assessmentItems = assessmentsResponse.data.map(item => ({
        id: item.id, 
        title: item.titulo,
        description: `Avaliação com ${item.exercicios?.length || 0} questões`,
        type: 'assessment',
        discipline: item.materia || item.titulo?.split(':')[0]?.replace('Exercícios de ', '') || 'Não especificado',
        gradeLevel: item.nivel_dificuldade || 'Não especificado',
        date: item.created_at,
        updatedAt: item.updated_at || item.created_at,
        favorite: item.favorite || false
      }));
      
      // Combinar todos os tipos de materiais
      const allMaterials = [...materialItems, ...exerciseItems, ...assessmentItems];
      console.log('Total de materiais combinados:', allMaterials.length);
      console.log('Materiais por tipo:', {
        material: materialItems.length,
        exercise: exerciseItems.length, 
        assessment: assessmentItems.length
      });
      
      return allMaterials;
    } catch (error) {
      console.error('Erro ao buscar materiais:', error);
      throw error;
    }
  },
  
  // Excluir material
  deleteMaterial: async (id, type) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }
      
      // Determinar endpoint com base no tipo
      let endpoint;
      switch(type) {
        case 'material':
          endpoint = `/materiais/${id}`;
          break;
        case 'exercise':
          endpoint = `/listas-exercicios/${id}`;
          break;
        case 'assessment':
          endpoint = `/avaliacoes/${id}`;
          break;
        default:
          throw new Error('Tipo de material inválido');
      }
      
      await axios.delete(`${API_URL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir material:', error);
      throw error;
    }
  }
};

export default materialsService;