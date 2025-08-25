import { API_BASE_URL } from '../lib/api';

export interface WhatsAppLink {
  id: string;
  name: string;
  description?: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class WhatsAppAPI {
  private baseUrl = `${API_BASE_URL}/whatsapp`;

  async getActiveLink(): Promise<WhatsAppLink | null> {
    try {
      const response = await fetch(`${this.baseUrl}/active`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // No active link
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('WhatsApp API response:', result);
      
      // Backend returns { success: true, data: link }
      if (result.success && result.data) {
        return result.data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching active WhatsApp link:', error);
      throw error;
    }
  }

  async getAllLinks(): Promise<WhatsAppLink[]> {
    try {
      const response = await fetch(this.baseUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('WhatsApp getAllLinks response:', result);
      
      // Backend returns { success: true, data: links }
      if (result.success && result.data) {
        return result.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching WhatsApp links:', error);
      throw error;
    }
  }
}

export const whatsappAPI = new WhatsAppAPI();
