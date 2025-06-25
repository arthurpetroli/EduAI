import api from './api';

const contentService = {
  // Gerar texto de apoio
  generateSupportText: async (materia, nivel, topico) => {
    try {
      const response = await api.post('/textos-apoio', {
        materia,
        nivel,
        topico
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Gerar lista de exercícios
  generateExerciseList: async (materia, nivel, topico, quantidade_exercicios, tipo_exercicio) => {
    try {
      const response = await api.post('/listas-exercicios', {
        materia,
        nivel,
        topico,
        quantidade_exercicios,
        tipo_exercicio
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // Exportar texto para PDF ou DOCX
  exportText: async (textoId, formato) => {
    try {
      const response = await api.get(`/textos-apoio/${textoId}/exportar/${formato}`, {
        responseType: 'blob'
      });
      
      // Criar um URL para o blob recebido
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `texto_apoio_${textoId}.${formato}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar:', error);
      throw error;
    }
  },
  
  // Exportar lista de exercícios para PDF ou DOCX
  exportExerciseList: async (listaId, formato) => {
    try {
      const response = await api.get(`/listas-exercicios/${listaId}/exportar/${formato}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lista_exercicios_${listaId}.${formato}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar:', error);
      throw error;
    }
  },
  
  // Gerar avaliação
  generateAssessment: async (materia, nivel, topico, quantidade_exercicios, dificuldade) => {
    try {
      const response = await api.post('/avaliacoes', {
        materia,
        nivel,
        topico,
        quantidade_exercicios,
        dificuldade
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Exportar avaliação
  exportAssessment: async (id, format, withAnswers = false) => {
    try {
      const response = await api.get(`/avaliacoes/${id}/export/${format}`, {
        params: { with_answers: withAnswers },
        responseType: 'blob'
      });
      
      // Criar um link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `avaliacao.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Exportar avaliação (nova versão)
  exportAssessment: async (assessmentData, format, includeAnswers = false) => {
    try {
      // Preparar os dados para a requisição
      const response = await api.post(`/export/assessment`, {
        assessment: assessmentData,
        format: format,
        includeAnswers: includeAnswers
      }, {
        responseType: 'blob' // Importante para receber o arquivo como blob
      });
      
      // Criar URL para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `avaliacao_${assessmentData.title || 'avaliacao'}.${format}`);
      
      // Anexar ao documento, clicar e remover
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return true;
    } catch (error) {
      console.error(`Erro ao exportar avaliação como ${format}:`, error);
      throw error;
    }
  },
};

export default contentService;