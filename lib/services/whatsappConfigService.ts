import { xbaseApi } from '../api';

interface WhatsAppConfig {
  phoneNumber: string;
  webhookUrl: string;
}

export class WhatsAppConfigService {
  private static CONFIG_KEY = 'whatsapp_config';

  static async saveConfig(config: WhatsAppConfig): Promise<void> {
    try {
      // TODO: Implementar chamada à API para salvar configurações
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Erro ao salvar configurações do WhatsApp:', error);
      throw new Error('Não foi possível salvar as configurações do WhatsApp');
    }
  }

  static async getConfig(): Promise<WhatsAppConfig | null> {
    try {
      // TODO: Implementar chamada à API para buscar configurações
      const savedConfig = localStorage.getItem(this.CONFIG_KEY);
      return savedConfig ? JSON.parse(savedConfig) : null;
    } catch (error) {
      console.error('Erro ao buscar configurações do WhatsApp:', error);
      return null;
    }
  }
} 