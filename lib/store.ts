"use client";

import { create } from 'zustand';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  NodeChange, 
  EdgeChange, 
  applyNodeChanges, 
  applyEdgeChanges,
  XYPosition
} from 'reactflow';
import { debounce } from 'lodash';
import { flowsApi } from './api';

export type NodeData = {
  label: string;
  type?: string;
  properties?: Record<string, any>;
};

export type CustomNode = Node<NodeData>;

interface FlowState {
  nodes: CustomNode[];
  edges: Edge[];
  selectedNode: CustomNode | null;
  selectedEdge: Edge | null;
  isDirty: boolean;
  isLoading: boolean;
  flowId: string | null;
  flowName: string | null;
  
  // Métodos para gerenciar nodes
  setNodes: (nodes: CustomNode[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  addNode: (type: string, position: XYPosition) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  setSelectedNode: (node: CustomNode | null) => void;
  
  // Métodos para gerenciar edges
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
  setSelectedEdge: (edge: Edge | null) => void;
  
  // Métodos para API
  saveFlow: () => Promise<void>;
  loadFlow: (id: string) => Promise<any>;
  setFlowId: (id: string | null) => void;
  updateFlowName: (name: string) => void;
  
  // Métodos para o estado da aplicação
  setIsDirty: (isDirty: boolean) => void;
}

const saveFlowToAPI = async (flowId: string | null, nodes: CustomNode[], edges: Edge[], name?: string | null) => {
  const data = { 
    nodes, 
    edges,
    name: name || `Fluxo ${Date.now().toString(36)}`
  };
  
  try {
    if (flowId) {
      await flowsApi.update(flowId, data);
    } else {
      const response = await flowsApi.create(data);
      return response.id;
    }
  } catch (error) {
    console.error('Erro ao salvar fluxo:', error);
    throw error;
  }
};

const debouncedSaveFlow = debounce(saveFlowToAPI, 2000);

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  selectedEdge: null,
  isDirty: false,
  isLoading: false,
  flowId: null,
  flowName: null,
  
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  
  onNodesChange: (changes) => {
    set(state => ({
      nodes: applyNodeChanges(changes, state.nodes),
      isDirty: true
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  addNode: (type, position) => {
    const newNode: CustomNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: { 
        label: `Novo ${type}`,
        type,
        properties: {}
      }
    };
    
    set(state => ({ 
      nodes: [...state.nodes, newNode],
      isDirty: true 
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  updateNodeData: (nodeId, newData) => {
    set(state => {
      const updatedNodes = state.nodes.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...newData }
          };
        }
        return node;
      });
      
      return { 
        nodes: updatedNodes,
        selectedNode: state.selectedNode?.id === nodeId 
          ? { ...state.selectedNode, data: { ...state.selectedNode.data, ...newData } } 
          : state.selectedNode,
        isDirty: true 
      };
    });
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  deleteNode: (nodeId) => {
    set(state => {
      // Remover o node
      const filteredNodes = state.nodes.filter(node => node.id !== nodeId);
      
      // Remover todas as conexões relacionadas a este node
      const filteredEdges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
      
      return { 
        nodes: filteredNodes, 
        edges: filteredEdges,
        selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode,
        isDirty: true 
      };
    });
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  setSelectedNode: (node) => set({ selectedNode: node }),
  
  setEdges: (edges) => set({ edges, isDirty: true }),
  
  onEdgesChange: (changes) => {
    set(state => ({
      edges: applyEdgeChanges(changes, state.edges),
      isDirty: true
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  onConnect: (connection) => {
    set(state => ({
      edges: addEdge({ ...connection, animated: true }, state.edges),
      isDirty: true
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  deleteEdge: (edgeId) => {
    set(state => ({ 
      edges: state.edges.filter(edge => edge.id !== edgeId),
      selectedEdge: state.selectedEdge?.id === edgeId ? null : state.selectedEdge,
      isDirty: true 
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, get().flowName);
  },
  
  setSelectedEdge: (edge) => set({ selectedEdge: edge }),
  
  saveFlow: async () => {
    set({ isLoading: true });
    try {
      const newId = await saveFlowToAPI(get().flowId, get().nodes, get().edges, get().flowName);
      set({ 
        isDirty: false, 
        isLoading: false,
        flowId: get().flowId || newId 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  loadFlow: async (id) => {
    set({ isLoading: true });
    try {
      const response = await flowsApi.getById(id);
      console.log('Dados do fluxo carregado:', response);
      
      // Garantir que nodes e edges sejam sempre arrays
      const nodes = Array.isArray(response.nodes) ? response.nodes : [];
      const edges = Array.isArray(response.edges) ? response.edges : [];
      const name = response.name || `Fluxo ${id.substring(0, 6)}`;
      
      set({ 
        nodes,
        edges,
        flowId: id,
        flowName: name,
        isDirty: false,
        isLoading: false
      });
      
      return response; // Retornar os dados do fluxo para uso externo
    } catch (error) {
      console.error('Erro ao carregar fluxo:', error);
      
      // Criar um fluxo padrão em caso de erro
      const defaultNodes = [
        {
          id: 'start-1',
          type: 'start',
          data: { 
            label: 'Início do Fluxo',
            type: 'start',
            properties: {}
          },
          position: { x: 250, y: 50 },
        }
      ];
      
      const defaultName = `Novo Fluxo ${id.substring(0, 6)}`;
      
      set({ 
        nodes: defaultNodes,
        edges: [],
        flowId: id,
        flowName: defaultName,
        isDirty: true,
        isLoading: false
      });
      
      // Notificar o usuário de que um novo fluxo foi criado
      console.log('Criado novo fluxo padrão devido a erro ao carregar:', defaultName);
      
      // Retornar dados padrão
      return {
        id,
        name: defaultName,
        nodes: defaultNodes,
        edges: []
      };
    }
  },
  
  setFlowId: (id) => set({ flowId: id }),
  
  updateFlowName: (name) => {
    set(state => ({ 
      flowName: name,
      isDirty: true 
    }));
    debouncedSaveFlow(get().flowId, get().nodes, get().edges, name);
  },
  
  setIsDirty: (isDirty) => set({ isDirty })
})); 