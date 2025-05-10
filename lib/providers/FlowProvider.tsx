'use client';

import React, { createContext, useContext, useEffect, useCallback, useState, useMemo } from 'react';
import { Node, Edge, ReactFlowProvider } from 'reactflow';
import { flowsApi } from '../api';
import { useToast } from './ToastProvider';

interface FlowContextData {
  nodes: Node[];
  edges: Edge[];
  flowId: string | null;
  flowName: string;
  isLoading: boolean;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  setFlowName: (name: string) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge) => void;
  removeEdge: (edgeId: string) => void;
  saveFlow: () => Promise<void>;
  loadFlow: (id: string) => Promise<void>;
  resetFlow: () => void;
}

const FlowContext = createContext<FlowContextData>({} as FlowContextData);

const AUTOSAVE_INTERVAL = 5000; // 5 segundos
const AUTOSAVE_KEY = 'flow_autosave';

// Componente interno que implementa a lógica do provider
function FlowProviderContent({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowName, setFlowName] = useState('Novo Fluxo');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');
  
  const { showToast } = useToast();

  console.log('FlowProvider renderizando', { flowId, isLoading, nodesLength: nodes.length });

  // Função para salvar o estado atual no localStorage
  const saveToLocalStorage = useCallback(() => {
    const currentState = {
      nodes: nodes, // Usamos o estado local
      edges: edges, // Usamos o estado local
      name: flowName,
      id: flowId,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(currentState));
  }, [nodes, edges, flowName, flowId]);

  // Função para carregar o último estado salvo do localStorage
  const loadFromLocalStorage = useCallback(() => {
    const savedState = localStorage.getItem(AUTOSAVE_KEY);
    if (savedState) {
      try {
        const { nodes: savedNodes, edges: savedEdges, name: savedName, id: savedId } = JSON.parse(savedState);
        setNodes(savedNodes);
        setEdges(savedEdges);
        setFlowName(savedName);
        setFlowId(savedId);
        return true;
      } catch (error) {
        console.error('Erro ao carregar estado salvo:', error);
      }
    }
    return false;
  }, []);

  // Função para salvar o estado atual
  const saveCurrentState = useCallback(() => {
    const currentState = JSON.stringify({
      nodes: nodes,
      edges: edges,
      name: flowName
    });
    setLastSavedState(currentState);
    saveToLocalStorage();
  }, [nodes, edges, flowName, saveToLocalStorage]);

  // Função para verificar mudanças não salvas
  const checkUnsavedChanges = useCallback(() => {
    const currentState = JSON.stringify({
      nodes: nodes,
      edges: edges,
      name: flowName
    });
    setHasUnsavedChanges(currentState !== lastSavedState);
  }, [nodes, edges, flowName, lastSavedState]);

  // Efeito para verificar mudanças não salvas
  useEffect(() => {
    checkUnsavedChanges();
  }, [nodes, edges, flowName, checkUnsavedChanges]);

  // Função para atualizar o nome do fluxo e salvar no servidor
  const updateFlowName = useCallback(async (name: string) => {
    setFlowName(name);
    
    // Atualiza também no servidor se tivermos um flowId
    if (flowId) {
      try {
        await flowsApi.update(flowId, {
          name: name,
          nodes: nodes,
          edges: edges
        });
        // Não definimos o estado de salvo aqui para não interferir no fluxo de alterações pendentes
      } catch (error) {
        console.error('Erro ao atualizar nome do fluxo:', error);
        showToast('O nome foi atualizado localmente, mas houve um erro ao salvar no servidor.', 'warning');
      }
    }
  }, [flowId, nodes, edges, showToast]);

  // Função para salvar o fluxo
  const saveFlow = useCallback(async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);

      if (flowId) {
        await flowsApi.update(flowId, {
          nodes: nodes,
          edges: edges,
          name: flowName
        });
      } else {
        const newFlow = await flowsApi.create({
          nodes: nodes,
          edges: edges,
          name: flowName
        });
        setFlowId(newFlow.id);
      }

      saveCurrentState();
      showToast('Fluxo salvo com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao salvar fluxo:', error);
      showToast('Erro ao salvar fluxo. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  }, [flowId, flowName, nodes, edges, isSaving, saveCurrentState, showToast]);

  // Função para carregar um fluxo
  const loadFlow = useCallback(async (id: string) => {
    console.log('Carregando fluxo:', id);
    if (isLoading) return;

    try {
      setIsLoading(true);
      const flow = await flowsApi.getById(id);
      console.log('Fluxo carregado:', flow);
      
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      setFlowName(flow.name || 'Novo Fluxo');
      setFlowId(flow.id);
      
      saveCurrentState();
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error);
      showToast('Erro ao carregar fluxo. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, saveCurrentState, showToast]);

  // Função para resetar o fluxo
  const resetFlow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setFlowId(null);
    setFlowName('Novo Fluxo');
    setHasUnsavedChanges(false);
    localStorage.removeItem(AUTOSAVE_KEY);
  }, []);

  // Funções para manipular nós
  const addNode = useCallback((node: Node) => {
    console.log('Adicionando nó:', node);
    setNodes(prev => [...prev, node]);
  }, []);

  const updateNode = useCallback((nodeId: string, data: any) => {
    setNodes(prev => prev.map(node => {
      if (node.id === nodeId) {
        // Se data contém position, atualizamos diretamente
        if (data.position) {
          return { ...node, position: data.position, data: { ...node.data, ...data.data } };
        }
        // Caso contrário, atualizamos apenas os dados internos
        return { ...node, data: { ...node.data, ...data } };
      }
      return node;
    }));
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    // Remover também as conexões relacionadas
    setEdges(prev => prev.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, []);

  // Funções para manipular conexões
  const addEdge = useCallback((edge: Edge) => {
    setEdges(prev => [...prev, edge]);
  }, []);

  const removeEdge = useCallback((edgeId: string) => {
    setEdges(prev => prev.filter(edge => edge.id !== edgeId));
  }, []);

  // Autosave a cada 5 segundos se houver mudanças não salvas
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autosaveTimer = setTimeout(() => {
      saveToLocalStorage();
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(autosaveTimer);
  }, [hasUnsavedChanges, saveToLocalStorage]);

  // Carregar último estado salvo ao iniciar
  useEffect(() => {
    const hasLoadedFromStorage = loadFromLocalStorage();
    if (hasLoadedFromStorage) {
      showToast('Último estado do fluxo restaurado', 'info');
    }
  }, [loadFromLocalStorage, showToast]);

  // Avisar sobre mudanças não salvas ao sair da página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Usar useMemo para o valor do contexto para evitar renderizações desnecessárias
  const contextValue = useMemo(() => ({
    nodes,
    edges,
    flowId,
    flowName,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setFlowName: updateFlowName,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    saveFlow,
    loadFlow,
    resetFlow
  }), [
    nodes, 
    edges, 
    flowId, 
    flowName, 
    isLoading, 
    isSaving, 
    hasUnsavedChanges, 
    updateFlowName, 
    addNode, 
    updateNode, 
    removeNode, 
    addEdge, 
    removeEdge, 
    saveFlow, 
    loadFlow, 
    resetFlow
  ]);

  return (
    <FlowContext.Provider value={contextValue}>
      {children}
    </FlowContext.Provider>
  );
}

// Componente exportado que combina o ReactFlowProvider com nosso FlowProviderContent
export function FlowProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <FlowProviderContent>{children}</FlowProviderContent>
    </ReactFlowProvider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow deve ser usado dentro de um FlowProvider');
  }
  return context;
} 