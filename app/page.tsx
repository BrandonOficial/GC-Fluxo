"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GitGraph, Plus, ArrowRight, Mail, Copy, Download, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { flowsApi } from '../lib/api';
import ClientWrapper from "../components/ClientWrapper";

export default function Home() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(!id);
  const [isLoading, setIsLoading] = useState(false);

  // Se há um ID na URL, redirecionar para a página de fluxo específica
  useEffect(() => {
    if (id) {
      router.push(`/flows/${id}`);
    }
  }, [id, router]);

  const createNewFlow = async () => {
    try {
      setIsLoading(true);
      // Criar um novo fluxo vazio
      const newFlow = await flowsApi.create({
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            data: { 
              label: 'Início do Fluxo',
              type: 'start',
              properties: {}
            },
            position: { x: 250, y: 150 },
          }
        ],
        edges: [],
        name: 'Novo Fluxo'
      });
      
      // Redirecionar para a edição do novo fluxo
      if (newFlow && newFlow.id) {
        router.push(`/flows/${newFlow.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar novo fluxo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de boas-vindas
  return (
    <ClientWrapper>
      <div className="flex h-screen w-screen flex-col bg-background text-foreground">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="flex items-center justify-center bg-card rounded-full p-6 mb-6">
            <GitGraph size={64} className="text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Funil de Vendas</h1>
          <p className="text-muted-foreground mb-6 max-w-lg text-center">
            Crie fluxos automatizados para gerenciar suas vendas e interações com clientes de maneira eficiente.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-2xl">
            <div className="p-4 border border-border rounded-md bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="text-blue-500" size={20} />
                <h3 className="font-medium">Envio de Email</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Configure envios de emails automáticos em seu funil de vendas.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Copy className="text-blue-500" size={20} />
                <h3 className="font-medium">Duplicação de Fluxos</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Duplique seus fluxos para criar variações sem começar do zero.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Download className="text-green-500" size={20} />
                <h3 className="font-medium">Importar/Exportar</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Faça backup ou compartilhe seus fluxos facilmente.
              </p>
            </div>
            
            <div className="p-4 border border-border rounded-md bg-card shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="text-amber-500" size={20} />
                <h3 className="font-medium">Validação</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Verifique se seu fluxo está corretamente configurado antes de executá-lo.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={createNewFlow}
              disabled={isLoading}
              className={`flex items-center gap-2 bg-primary ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'} text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors`}
            >
              <Plus size={20} />
              <span>{isLoading ? 'Criando...' : 'Criar Novo Fluxo'}</span>
            </button>
            
            <Link
              href="/flows"
              className="flex items-center gap-2 border border-border hover:bg-card/80 px-6 py-3 rounded-md font-medium transition-colors"
            >
              <span>Ver Todos os Fluxos</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </ClientWrapper>
  );
}
