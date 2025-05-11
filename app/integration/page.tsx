"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Save } from 'lucide-react';
import { WhatsAppConfigService } from '@/lib/services/whatsappConfigService';

export default function WhatsAppIntegrationPage() {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const config = await WhatsAppConfigService.getConfig();
      if (config) {
        setWhatsappNumber(config.phoneNumber);
        setWebhookUrl(config.webhookUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await WhatsAppConfigService.saveConfig({
        phoneNumber: whatsappNumber,
        webhookUrl: webhookUrl
      });
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsappNumber(e.target.value);
  };

  const handleWebhookUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebhookUrl(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto text-center">
          Carregando configurações...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-8 w-8 text-[#25D366]" />
          <h1 className="text-2xl font-bold">Configuração do WhatsApp</h1>
        </div>

        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número do WhatsApp
              </label>
              <Input
                type="text"
                value={whatsappNumber}
                onChange={handleWhatsAppNumberChange}
                placeholder="Ex: +5511999999999"
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                Digite o número completo com código do país e DDD
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Webhook
              </label>
              <Input
                type="text"
                value={webhookUrl}
                onChange={handleWebhookUrlChange}
                placeholder="https://sua-api.com/webhook"
                className="w-full"
              />
              <p className="mt-1 text-sm text-gray-500">
                URL para receber as respostas do WhatsApp
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              >
                {isSaving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 