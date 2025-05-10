"use client";

import React, { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlow } from '@/lib/providers/FlowProvider';
import WhatsAppNode from './nodes/WhatsAppNode';
import WaitNode from './nodes/WaitNode';
import ConditionalNode from './nodes/ConditionalNode';
import SendEmailNode from './nodes/SendEmailNode';
import Toolbar from './Toolbar';
import FlowBoards from './FlowBoards';
import Navbar from './ui/Navbar';
import { Edit, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

const nodeTypes = {
  whatsapp: WhatsAppNode,
  wait: WaitNode,
  conditional: ConditionalNode,
  sendEmail: SendEmailNode,
};

interface FlowEditorProps {
  flowId: string;
}

// Componente interno que usa hooks de ReactFlow
function FlowEditorContent({ flowId }: FlowEditorProps) {
  console.log('FlowEditorContent iniciando renderização com flowId:', flowId);
  const router = useRouter();
  const {
    nodes: initialNodes,
    edges: initialEdges,
    flowName,
    setFlowName,
    addNode,
    updateNode,
    removeNode,
    addEdge: addEdgeToContext,
    removeEdge: removeEdgeFromContext,
    saveFlow,
    hasUnsavedChanges,
    loadFlow,
    isLoading,
  } = useFlow();

  console.log('FlowEditorContent renderizando', { flowId, isLoading, nodesCount: initialNodes?.length });

  // Flag para controlar se já carregamos os dados
  const hasLoaded = useRef(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
  const reactFlowInstance = useReactFlow();
  const { getNode, project } = reactFlowInstance;

  // Carregar o fluxo apenas uma vez
  useEffect(() => {
    console.log('useEffect loadFlow com flowId:', flowId, 'hasLoaded:', hasLoaded.current);
    if (flowId && !hasLoaded.current) {
      hasLoaded.current = true;
      loadFlow(flowId).catch((error) => {
        console.error('Erro ao carregar fluxo:', error);
        router.push('/flows');
      });
    }
  }, [flowId, loadFlow, router]);

  // Atualizar os nodes e edges quando o provider atualizar
  useEffect(() => {
    if (initialNodes?.length > 0) {
      console.log('Atualizando nodes do ReactFlow:', initialNodes.length);
      setNodes(initialNodes);
    }
  }, [initialNodes, setNodes]);

  useEffect(() => {
    if (initialEdges?.length > 0) {
      console.log('Atualizando edges do ReactFlow:', initialEdges.length);
      setEdges(initialEdges);
    }
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = addEdge(connection, edges);
      setEdges(newEdge);
      addEdgeToContext(newEdge[newEdge.length - 1]);
    },
    [edges, setEdges, addEdgeToContext]
  );

  const onNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      updateNode(node.id, { position: node.position });
    },
    [updateNode]
  );

  const onNodeDelete = useCallback(
    (node: Node) => {
      removeNode(node.id);
    },
    [removeNode]
  );

  const onEdgeDelete = useCallback(
    (edge: Edge) => {
      removeEdgeFromContext(edge.id);
    },
    [removeEdgeFromContext]
  );

  const handleSave = useCallback(() => {
    saveFlow();
  }, [saveFlow]);

  // Método para adicionar novo nó quando arrastado da área de boards
  const handleBoardDrop = useCallback((board: any, position: { x: number, y: number }) => {
    if (!board) return;
    
    addNode({
      id: `${board.type}-${Date.now()}`,
      type: board.type,
      position,
      data: {
        label: board.title,
        type: board.type,
      },
    });
  }, [addNode]);

  // Lidando com o drop no editor de fluxo
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      // Obter a posição do ReactFlow
      const reactFlowBounds = event.currentTarget.getBoundingClientRect();
      
      // Calcular a posição relativa
      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      try {
        const boardData = JSON.parse(event.dataTransfer.getData('application/json'));
        
        // Criar um novo nó
        const newNode = {
          id: `${boardData.type}-${Date.now()}`,
          type: boardData.type,
          position,
          data: {
            label: boardData.title,
            type: boardData.type,
          },
        };

        addNode(newNode);
      } catch (error) {
        console.error('Erro ao processar o drag and drop:', error);
      }
    },
    [project, addNode]
  );

  // Atualizar o título com o status
  useEffect(() => {
    document.title = `${flowName}${hasUnsavedChanges ? ' *' : ''}`;
  }, [flowName, hasUnsavedChanges]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">
            {flowName}
          </h1>
          {hasUnsavedChanges && (
            <span className="text-yellow-400 text-sm">(Não salvo)</span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Salvar
        </button>
      </div>

      <div className="flex-1 flex">
        <div className="w-80 border-r border-border">
          <FlowBoards onBoardDrop={handleBoardDrop} />
        </div>
        <div className="flex-1">
          <div 
            className="h-full"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeDragStop={onNodeDragStop}
              onNodesDelete={(nodes) => nodes.forEach(onNodeDelete)}
              onEdgesDelete={(edges) => edges.forEach(onEdgeDelete)}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
              <Toolbar />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal que envolve o conteúdo com o provider necessário
export default function FlowEditor(props: FlowEditorProps) {
  return (
    <ReactFlowProvider>
      <FlowEditorContent {...props} />
    </ReactFlowProvider>
  );
}