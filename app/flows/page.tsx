"use client";

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash, RotateCcw, Search, GitGraph, Copy, Download, Upload, Trash2, Edit2, Check } from 'lucide-react';
import { flowsApi } from '../../lib/api';
import ClientWrapper from '../../components/ClientWrapper';
import Navbar from '../../components/ui/Navbar';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/providers/ToastProvider';

interface Flow {
  id: string;
  name: string;
  updatedAt: string;
  nodes?: any[];
  edges?: any[];
}

function FlowsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [editingFlowName, setEditingFlowName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const fetchFlows = async () => {
    setIsLoading(true);
    try {
      const response = await flowsApi.getAll();
      // Garantir que a resposta é um array
      const flowsArray = Array.isArray(response) ? response : [];
      console.log('Dados da API:', response);
      
      // Verificar se há IDs duplicados e filtrar para manter apenas a primeira ocorrência
      const processedFlows: Flow[] = [];
      const existingIds = new Set<string>();
      
      flowsArray.forEach(flow => {
        if (!existingIds.has(flow.id)) {
          existingIds.add(flow.id);
          processedFlows.push(flow);
        } else {
          console.warn(`ID duplicado encontrado e removido: ${flow.id}`);
        }
      });
      
      setFlows(processedFlows);
      setError('');
    } catch (err) {
      console.error('Erro ao carregar fluxos:', err);
      setError('Não foi possível carregar os fluxos. Tente novamente mais tarde.');
      setFlows([]); // Definir como array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      try {
        await flowsApi.delete(id);
        setFlows(prev => prev.filter(flow => flow.id !== id));
        showToast('Fluxo excluído com sucesso!', 'success');
      } catch (err) {
        console.error('Erro ao excluir fluxo:', err);
        showToast('Erro ao excluir fluxo. Tente novamente.', 'error');
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await flowsApi.duplicate(id);
      // Em vez de adicionar o fluxo ao estado, recarregamos todos os fluxos
      await fetchFlows();
      alert(`Fluxo duplicado com sucesso!`);
    } catch (err) {
      console.error('Erro ao duplicar fluxo:', err);
      alert('Não foi possível duplicar o fluxo. Tente novamente mais tarde.');
    }
  };

  const handleExportFlow = async (id: string) => {
    try {
      const flow = await flowsApi.getById(id);
      
      // Criar objeto para exportação
      const exportData = {
        name: flow.name,
        nodes: flow.nodes,
        edges: flow.edges,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      // Converter para JSON e criar blob
      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      
      // Criar URL para download
      const url = URL.createObjectURL(blob);
      
      // Criar elemento de link e simular clique
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flow.name.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpar
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao exportar fluxo:', err);
      alert('Não foi possível exportar o fluxo. Tente novamente mais tarde.');
    }
  };

  const handleImportClick = () => {
    // Acionar o input de arquivo quando o botão for clicado
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImportFlow = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Ler o arquivo como texto
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        if (!event.target?.result) return;
        
        try {
          // Processar o JSON
          const importData = JSON.parse(event.target.result as string);
          
          // Validar o formato básico
          if (!importData.name || !importData.nodes || !importData.edges) {
            throw new Error('Formato de arquivo inválido');
          }

          // Processar os nós e arestas para garantir IDs únicos
          const idMap: Record<string, string> = {};
          
          // Gerar novos IDs para os nós
          const nodesWithNewIds = importData.nodes.map((node: any) => {
            const newId = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${Math.floor(Math.random() * 10000).toString(36)}`;
            idMap[node.id] = newId;
            return {
              ...node,
              id: newId
            };
          });
          
          // Atualizar as referências nas arestas
          const edgesWithNewIds = importData.edges.map((edge: any) => {
            const newSource = idMap[edge.source] || edge.source;
            const newTarget = idMap[edge.target] || edge.target;
            const newId = `edge_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${Math.floor(Math.random() * 10000).toString(36)}`;
            
            return {
              ...edge,
              id: newId,
              source: newSource,
              target: newTarget
            };
          });
          
          // Criar novo fluxo com os dados importados e IDs únicos
          const newFlow = await flowsApi.create({
            name: `${importData.name} (Importado)`,
            nodes: nodesWithNewIds,
            edges: edgesWithNewIds
          });
          
          // Em vez de adicionar o fluxo ao estado, recarregamos todos os fluxos
          await fetchFlows();
          alert(`Fluxo importado com sucesso: ${newFlow.name}`);
          
          // Limpar o input de arquivo
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (parseError) {
          console.error('Erro ao processar arquivo importado:', parseError);
          alert('O arquivo selecionado não é válido. Por favor, selecione um arquivo JSON exportado por este sistema.');
        }
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('Erro ao importar fluxo:', err);
      alert('Não foi possível importar o fluxo. Tente novamente mais tarde.');
    }
  };

  // Filtragem por busca
  const filteredFlows = flows
    .filter(flow => 
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flow.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleCreateFlow = async () => {
    try {
      const newFlow = await flowsApi.create({
        name: 'Novo Fluxo',
        nodes: [],
        edges: [],
      });
      router.push(`/flows/${newFlow.id}`);
    } catch (error) {
      console.error('Erro ao criar fluxo:', error);
      showToast('Erro ao criar fluxo. Tente novamente.', 'error');
    }
  };

  const startEditing = (flow: Flow) => {
    setEditingFlowId(flow.id);
    setEditingFlowName(flow.name);
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, 0);
  };

  const saveFlowName = async () => {
    if (!editingFlowId) return;
    
    try {
      const flowToUpdate = flows.find(f => f.id === editingFlowId);
      if (!flowToUpdate) return;
      
      // Atualizar diretamente na API
      await flowsApi.update(editingFlowId, {
        name: editingFlowName,
        nodes: flowToUpdate.nodes || [],
        edges: flowToUpdate.edges || []
      });
      
      // Atualizar o estado local
      setFlows(prev => prev.map(flow => 
        flow.id === editingFlowId ? { ...flow, name: editingFlowName } : flow
      ));
      
      showToast('Nome do fluxo atualizado com sucesso!', 'success');
    } catch (err) {
      console.error('Erro ao atualizar nome do fluxo:', err);
      showToast('Erro ao atualizar nome do fluxo. Tente novamente.', 'error');
    } finally {
      setEditingFlowId(null);
    }
  };

  const cancelEditing = () => {
    setEditingFlowId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveFlowName();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Meus Fluxos</h1>
          
          <div className="flex gap-4">
            {flows.length > 0 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar fluxos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64"
                />
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              </div>
            )}
            
            <button
              onClick={handleImportClick}
              className="hover:bg-card border border-border px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Upload size={16} />
              <span>Importar</span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportFlow}
                accept=".json"
                className="hidden"
              />
            </button>
            
            <button
              onClick={handleCreateFlow}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              <span>Novo Fluxo</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center my-12">
            <RotateCcw className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-lg">
            {error}
            <button 
              onClick={fetchFlows}
              className="ml-4 underline"
            >
              Tentar novamente
            </button>
          </div>
        ) : filteredFlows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-border">
            {searchTerm ? (
              <>
                <p className="text-muted-foreground mb-4">Nenhum fluxo encontrado para "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="text-primary hover:underline"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-center bg-background rounded-full p-6 mb-6 border border-border">
                  <GitGraph size={48} className="text-primary" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Comece a criar seus fluxos</h2>
                <p className="text-muted-foreground mb-8 max-w-md text-center">
                  Você ainda não tem nenhum fluxo criado. Comece a criar seu primeiro fluxo para automatizar suas vendas.
                </p>
                <Link 
                  href="/"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center gap-2 transition-colors"
                >
                  <Plus size={20} />
                  <span>Criar Novo Fluxo</span>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg shadow-md border border-border overflow-hidden">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary/30">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nome
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Última atualização
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFlows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingFlowId === flow.id ? (
                        <div className="flex items-center">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editingFlowName}
                            onChange={(e) => setEditingFlowName(e.target.value)}
                            onBlur={saveFlowName}
                            onKeyDown={handleKeyDown}
                            className="flex-1 border border-gray-300 rounded py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={saveFlowName}
                            className="ml-2 p-1 text-green-500 hover:text-green-600"
                            title="Salvar"
                          >
                            <Check size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="font-medium group flex items-center">
                          {flow.name || `Fluxo ${flow.id.substring(0, 6)}`}
                          <button
                            onClick={() => startEditing(flow)}
                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-gray-700"
                            title="Editar nome"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">ID: {flow.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(flow.updatedAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        href={`/?id=${flow.id}`}
                        className="text-primary hover:text-primary/80 inline-flex items-center gap-1 transition-colors"
                      >
                        <Edit2 size={16} />
                        <span>Editar</span>
                      </Link>
                      <button
                        onClick={() => handleDuplicate(flow.id)}
                        className="text-blue-500 hover:text-blue-400 inline-flex items-center gap-1 ml-4 transition-colors"
                      >
                        <Copy size={16} />
                        <span>Duplicar</span>
                      </button>
                      <button
                        onClick={() => handleExportFlow(flow.id)}
                        className="text-green-500 hover:text-green-400 inline-flex items-center gap-1 ml-4 transition-colors"
                      >
                        <Download size={16} />
                        <span>Exportar</span>
                      </button>
                      <button
                        onClick={() => handleDelete(flow.id)}
                        className="text-destructive hover:text-destructive/80 inline-flex items-center gap-1 ml-4 transition-colors"
                      >
                        <Trash2 size={16} />
                        <span>Excluir</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ClientWrapper>
      <FlowsPage />
    </ClientWrapper>
  );
} 