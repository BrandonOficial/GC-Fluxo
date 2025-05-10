"use client";

import React, { useState } from 'react';
import { MessageSquare, Clock, GitBranch, Save, RotateCcw, Plus, Mail, AlertTriangle, X } from 'lucide-react';
import { validateFlow } from '../lib/utils';
import { Panel } from 'reactflow';
import { useFlow } from '@/lib/providers/FlowProvider';

const Toolbar: React.FC = () => {
  const { 
    addNode,
    nodes,
    edges,
    saveFlow,
    hasUnsavedChanges,
    isSaving
  } = useFlow();
  
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  
  const handleAddNode = (type: string) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 100, y: 100 },
      data: {
        label: type === 'message' ? 'Nova Mensagem' :
               type === 'wait' ? 'Nova Espera' :
               type === 'conditional' ? 'Nova Condição' :
               'Novo Email',
        type: type
      },
    };

    addNode(newNode);
  };
  
  const handleSave = async () => {
    if (hasUnsavedChanges) {
      try {
        await saveFlow();
      } catch (error) {
        console.error('Erro ao salvar o fluxo:', error);
      }
    }
  };
  
  const handleValidateFlow = () => {
    if (!nodes || !edges) return;
    
    const { isValid, errors } = validateFlow(nodes, edges);
    setValidationErrors(errors);
    setShowValidation(true);
    
    // Se não houver erros, fechar após 3 segundos
    if (isValid) {
      setTimeout(() => {
        setShowValidation(false);
      }, 3000);
    }
  };
  
  return (
    <Panel position="top-center" className="mt-3">
      <div className="bg-card rounded-lg shadow-md border border-border flex items-center">
        <div className="border-r border-border px-4 py-2">
          <p className="text-sm font-medium mb-1 text-muted-foreground">Adicionar Node</p>
          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-md hover:bg-secondary flex flex-col items-center transition-colors"
              onClick={() => handleAddNode('message')}
              title="Adicionar Mensagem"
            >
              <MessageSquare size={18} className="text-blue-500 mb-1" />
              <span className="text-xs">Mensagem</span>
            </button>
            
            <button
              className="p-2 rounded-md hover:bg-secondary flex flex-col items-center transition-colors"
              onClick={() => handleAddNode('wait')}
              title="Adicionar Espera"
            >
              <Clock size={18} className="text-yellow-500 mb-1" />
              <span className="text-xs">Espera</span>
            </button>
            
            <button
              className="p-2 rounded-md hover:bg-secondary flex flex-col items-center transition-colors"
              onClick={() => handleAddNode('conditional')}
              title="Adicionar Condição"
            >
              <GitBranch size={18} className="text-purple-500 mb-1" />
              <span className="text-xs">Condição</span>
            </button>
            
            <button
              className="p-2 rounded-md hover:bg-secondary flex flex-col items-center transition-colors"
              onClick={() => handleAddNode('sendEmail')}
              title="Enviar Email"
            >
              <Mail size={18} className="text-blue-500 mb-1" />
              <span className="text-xs">Email</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2">
          <button 
            className={`flex items-center gap-2 py-2 px-4 rounded-md transition-colors ${
              hasUnsavedChanges 
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
            }`}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? (
              <RotateCcw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            <span>Salvar{hasUnsavedChanges ? '*' : ''}</span>
          </button>
          
          <button 
            className="flex items-center gap-2 py-2 px-4 rounded-md transition-colors border border-border hover:bg-secondary"
            onClick={handleValidateFlow}
          >
            <AlertTriangle size={16} className="text-amber-500" />
            <span>Validar</span>
          </button>
        </div>
        
        <div className="px-4 border-l border-border">
          <button
            className="p-2 rounded-md hover:bg-secondary flex items-center gap-1 transition-colors text-sm"
            onClick={() => {}}
            title="Mais opções"
          >
            <span className="text-muted-foreground">Nodes: {nodes?.length || 0}</span>
            <Plus size={14} className="text-muted-foreground" />
          </button>
        </div>
      </div>
      
      {showValidation && (
        <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-md border shadow-md z-50 ${
          validationErrors.length === 0 
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        }`}>
          {validationErrors.length === 0 ? (
            <div className="flex items-center text-green-700 dark:text-green-400">
              <span>✓ Fluxo válido! Todos os nós estão corretamente configurados.</span>
              <button 
                className="ml-auto text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                onClick={() => setShowValidation(false)}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center text-red-700 dark:text-red-400 mb-2">
                <AlertTriangle size={16} className="mr-2" />
                <span>Foram encontrados {validationErrors.length} problemas no fluxo:</span>
                <button 
                  className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => setShowValidation(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <ul className="space-y-1 text-sm text-red-700 dark:text-red-400 list-disc pl-5">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
};

export default Toolbar; 