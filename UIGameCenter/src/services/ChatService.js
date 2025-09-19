const API_BASE_URL = 'http://localhost:3001/api/v1'; // Para emulador
// const API_BASE_URL = 'http://tu-ip-local:3001/api/v1'; // Para dispositivo físico

class ChatService {
  // Enviar mensaje al chatbot
  static async sendMessage(message, model = 'llama2') {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message.trim(),
          model: model 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error del servidor');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Verificar estado del servicio
  static async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'ERROR', error: error.message };
    }
  }

  // Obtener estadísticas
  static async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/stats`);
      return await response.json();
    } catch (error) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }
}

export default ChatService;