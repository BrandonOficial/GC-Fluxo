"use client";

import React, { useState } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';
import { MessageSquare, Clock, GitBranch, Play, X, Settings, ArrowRight, Mail } from 'lucide-react';
import SendMessageProperties from './properties/SendMessageProperties';
import DelayProperties from './properties/DelayProperties';
import ConditionalProperties from './properties/ConditionalProperties';
import EmailProperties from './properties/EmailProperties';

const SidePanel: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { nodes, updateNode } = useFlow();
  
  // Encontrar o nó selecionado pelo id (se houver)
  const findSelectedNode = () => {
    const selectedNodeId = localStorage.getItem('selectedNodeId');
    if (!selectedNodeId) return null;
    
    return nodes.find(node => node.id === selectedNodeId);
  };
  
  const currentSelectedNode = selectedNode || findSelectedNode();
  
  if (!currentSelectedNode) {
    return (
      <div className="w-80 border-l border-border bg-card h-screen overflow-hidden pt-14">
        <div className="p-6">
          <h2 className="text-lg font-medium mb-2">Propriedades do Nó</h2>
          <p className="text-muted-foreground text-sm">
            Selecione um nó no editor para configurar suas propriedades.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="border border-border rounded-md p-4 bg-background/50">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <ArrowRight size={16} className="text-blue-500" />
                <span>Dica</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Arraste os nós para organizá-los no fluxo. Conecte os nós clicando e arrastando de um ponto de conexão para outro.
              </p>
            </div>
            
            <div className="border border-border rounded-md p-4 bg-background/50">
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Settings size={16} className="text-amber-500" />
                <span>Configurações</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Use a barra de ferramentas superior para adicionar novos nós e salvar seu fluxo.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const handleClosePanel = () => {
    setSelectedNode(null);
    localStorage.removeItem('selectedNodeId');
  };
  
  const renderNodeProperties = () => {
    const nodeType = currentSelectedNode.data.type;
    
    switch (nodeType) {
      case 'sendMessage':
        return <SendMessageProperties node={currentSelectedNode} />;
      case 'delay':
        return <DelayProperties node={currentSelectedNode} />;
      case 'conditional':
        return <ConditionalProperties node={currentSelectedNode} />;
      case 'sendEmail':
        return <EmailProperties nodeId={currentSelectedNode.id} data={currentSelectedNode.data} />;
      case 'start':
        return (
          <div className="p-6">
            <h3 className="font-medium mb-2">Nó Inicial</h3>
            <p className="text-sm text-muted-foreground">
              Este é o ponto de entrada do seu fluxo. Todas as jornadas começam a partir deste nó.
            </p>
            
            <div className="mt-4 border border-border rounded-md p-4 bg-background/50">
              <h4 className="text-sm font-medium mb-2">Próximos passos</h4>
              <p className="text-xs text-muted-foreground">
                Adicione um nó de mensagem ou espera conectado a este nó inicial para começar a construir seu funil.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-6">
            <p className="text-sm text-muted-foreground">
              Propriedades não disponíveis para este tipo de nó.
            </p>
          </div>
        );
    }
  };
  
  const getNodeIcon = () => {
    const nodeType = currentSelectedNode.data.type;
    
    switch (nodeType) {
      case 'sendMessage':
        return <MessageSquare className="text-blue-500" size={20} />;
      case 'delay':
        return <Clock className="text-amber-500" size={20} />;
      case 'conditional':
        return <GitBranch className="text-purple-500" size={20} />;
      case 'sendEmail':
        return <Mail className="text-blue-500" size={20} />;
      case 'start':
        return <Play className="text-green-500" size={20} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="w-80 border-l border-border bg-card h-screen overflow-y-auto pt-14">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center">
          {getNodeIcon()}
          <h2 className="ml-2 font-semibold">{currentSelectedNode.data.label}</h2>
        </div>
        <button 
          onClick={handleClosePanel}
          className="p-1 hover:bg-secondary rounded-md transition-colors"
          title="Fechar painel"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="border-b border-border px-4 py-2 bg-background/30">
        <p className="text-xs text-muted-foreground">ID: {currentSelectedNode.id}</p>
        <p className="text-xs text-muted-foreground">Tipo: {currentSelectedNode.data.type}</p>
      </div>
      
      {renderNodeProperties()}
    </div>
  );
};

export default SidePanel; 