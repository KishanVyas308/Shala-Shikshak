import api from '../lib/api';

export interface WhatsAppLink {
  id: string;
  name: string;
  description?: string;
  url: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWhatsAppLinkData {
  name: string;
  description?: string;
  url: string;
}

export interface UpdateWhatsAppLinkData {
  name: string;
  description?: string;
  url: string;
}

class WhatsAppAPI {
  // Get active WhatsApp link (public)
  async getActiveLink(): Promise<WhatsAppLink | null> {
    try {
      const response = await api.get('/whatsapp/active');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching active WhatsApp link:', error);
      return null;
    }
  }

  // Get all WhatsApp links (admin only)
  async getAllLinks(): Promise<WhatsAppLink[]> {
    try {
      const response = await api.get('/whatsapp');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching WhatsApp links:', error);
      throw error;
    }
  }

  // Create new WhatsApp link (admin only)
  async createLink(data: CreateWhatsAppLinkData): Promise<WhatsAppLink> {
    try {
      const response = await api.post('/whatsapp', data);
      return response.data.data;
    } catch (error) {
      console.error('Error creating WhatsApp link:', error);
      throw error;
    }
  }

  // Update WhatsApp link (admin only)
  async updateLink(id: string, data: UpdateWhatsAppLinkData): Promise<WhatsAppLink> {
    try {
      const response = await api.put(`/whatsapp/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('Error updating WhatsApp link:', error);
      throw error;
    }
  }

  // Activate WhatsApp link (admin only)
  async activateLink(id: string): Promise<WhatsAppLink> {
    try {
      const response = await api.patch(`/whatsapp/${id}/activate`);
      return response.data.data;
    } catch (error) {
      console.error('Error activating WhatsApp link:', error);
      throw error;
    }
  }

  // Deactivate all WhatsApp links (admin only)
  async deactivateAllLinks(): Promise<void> {
    try {
      await api.patch('/whatsapp/deactivate-all');
    } catch (error) {
      console.error('Error deactivating WhatsApp links:', error);
      throw error;
    }
  }

  // Delete WhatsApp link (admin only)
  async deleteLink(id: string): Promise<void> {
    try {
      await api.delete(`/whatsapp/${id}`);
    } catch (error) {
      console.error('Error deleting WhatsApp link:', error);
      throw error;
    }
  }
}

export const whatsappAPI = new WhatsAppAPI();
