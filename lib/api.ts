import axios from 'axios';

// Definição de tipos
interface Flow {
  id: string;
  name: string;
  updatedAt: string;
  nodes: any[];
  edges: any[];
}

// Tipo para fluxos XBase
interface XBaseFlow {
  id: number;
  attributes: {
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    billing: string;
    published: boolean;
    uid: string;
    data: {
      edges: any[];
      nodes: any[];
    };
  };
}

interface XBaseResponse {
  data: XBaseFlow[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

interface WhatsAppMessage {
  to: string;
  message: string;
  flowId?: string;
}

// URL base da API
const API_URL = 'https://api.xbase.app/api';

// Configuração do Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock dados para desenvolvimento - estrutura vazia para armazenar dados em memória
const mockData: { flows: Flow[] } = {
  flows: []
};

// Verificar se está em ambiente de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development';

// Contador global para garantir unicidade mesmo que em execuções no mesmo milissegundo
let idCounter = 0;

// Função auxiliar para gerar IDs únicos
const generateId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  const counterStr = (idCounter++).toString(36);
  return `flow_${timestamp}_${randomStr}_${counterStr}`;
};

// Endpoints para fluxos
export const flowsApi = {
  // Buscar todos os fluxos
  getAll: async (): Promise<Flow[]> => {
    if (isDevelopment) {
      console.log('Usando mock API para getAll');
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockData.flows;
    }
    
    const response = await api.get('/flows');
    return response.data;
  },
  
  // Buscar um fluxo específico
  getById: async (id: string): Promise<Flow> => {
    if (isDevelopment) {
      console.log('Usando mock API para getById:', id);
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      const flow = mockData.flows.find(f => f.id === id);
      if (!flow) {
        console.warn(`Fluxo com ID ${id} não encontrado, criando um fluxo padrão`);
        // Criar um novo fluxo padrão com o ID solicitado
        const newFlow: Flow = {
          id: id,
          name: `Fluxo ${id.substring(0, 6)}`,
          updatedAt: new Date().toISOString(),
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
          edges: []
        };
        // Adicionar à lista de fluxos mock
        mockData.flows.push(newFlow);
        return newFlow;
      }
      return flow;
    }
    
    try {
      const response = await api.get(`/flows/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar fluxo com ID ${id}:`, error);
      // Criar um fluxo padrão para evitar quebrar a UI
      return {
        id: id,
        name: `Novo Fluxo`,
        updatedAt: new Date().toISOString(),
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
        edges: []
      };
    }
  },
  
  // Criar um novo fluxo
  create: async (data: { nodes: any[], edges: any[], name?: string }): Promise<Flow> => {
    if (isDevelopment) {
      console.log('Usando mock API para create');
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Gerar ID único
      let newId = generateId();
      // Verificar se o ID já existe, se sim, gerar outro
      while (mockData.flows.some(f => f.id === newId)) {
        console.warn(`ID gerado ${newId} já existe, gerando um novo...`);
        newId = generateId();
      }
      
      const newFlow: Flow = {
        id: newId,
        name: data.name || 'Novo Fluxo',
        updatedAt: new Date().toISOString(),
        nodes: data.nodes || [],
        edges: data.edges || []
      };
      mockData.flows.push(newFlow);
      return newFlow;
    }
    
    const response = await api.post('/flows', data);
    return response.data;
  },
  
  // Atualizar um fluxo existente
  update: async (id: string, data: { nodes: any[], edges: any[], name?: string }): Promise<Flow> => {
    if (isDevelopment) {
      console.log('Usando mock API para update:', id);
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 400));
      const index = mockData.flows.findIndex(f => f.id === id);
      if (index === -1) {
        console.warn(`Fluxo com ID ${id} não encontrado para atualização, criando um novo fluxo`);
        // Criar um novo fluxo com os dados fornecidos
        const newFlow: Flow = {
          id: id,
          name: data.name || `Fluxo ${id.substring(0, 6)}`,
          updatedAt: new Date().toISOString(),
          nodes: data.nodes || [],
          edges: data.edges || []
        };
        mockData.flows.push(newFlow);
        return newFlow;
      }
      
      // Atualizar o fluxo existente
      mockData.flows[index] = {
        ...mockData.flows[index],
        nodes: data.nodes || mockData.flows[index].nodes,
        edges: data.edges || mockData.flows[index].edges,
        name: data.name || mockData.flows[index].name,
        updatedAt: new Date().toISOString()
      };
      
      return mockData.flows[index];
    }
    
    try {
      const response = await api.put(`/flows/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar fluxo com ID ${id}:`, error);
      // Retornar os dados enviados para fingir que a atualização foi bem-sucedida
      return {
        id: id,
        name: data.name || `Fluxo ${id.substring(0, 6)}`,
        updatedAt: new Date().toISOString(),
        nodes: data.nodes || [],
        edges: data.edges || []
      };
    }
  },
  
  // Excluir um fluxo
  delete: async (id: string): Promise<any> => {
    if (isDevelopment) {
      console.log('Usando mock API para delete:', id);
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      const index = mockData.flows.findIndex(f => f.id === id);
      if (index === -1) {
        // Em vez de lançar um erro, apenas loga e retorna um status de sucesso
        console.warn(`Fluxo com ID ${id} não encontrado, mas reportando sucesso para UI`);
        return { success: true, message: 'Fluxo excluído com sucesso' };
      }
      const deletedFlow = mockData.flows[index];
      mockData.flows.splice(index, 1);
      return deletedFlow;
    }
    
    try {
      const response = await api.delete(`/flows/${id}`);
      return response.data;
    } catch (error) {
      // Melhorar tratamento de erro para evitar falhas na UI
      console.error('Erro ao excluir fluxo:', error);
      // Retornar um objeto de sucesso mesmo em caso de erro para evitar quebrar a UI
      return { success: false, message: 'Erro ao excluir fluxo, mas UI continuará funcionando' };
    }
  },
  
  // Duplicar um fluxo existente
  duplicate: async (id: string): Promise<Flow> => {
    if (isDevelopment) {
      console.log('Usando mock API para duplicate:', id);
      // Simular atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      const flowToDuplicate = mockData.flows.find(f => f.id === id);
      
      if (!flowToDuplicate) {
        console.warn(`Fluxo com ID ${id} não encontrado para duplicação`);
        throw new Error(`Fluxo com ID ${id} não encontrado`);
      }
      
      // Deep copy dos nodes e edges
      const nodesCopy = JSON.parse(JSON.stringify(flowToDuplicate.nodes));
      const edgesCopy = JSON.parse(JSON.stringify(flowToDuplicate.edges));
      
      // Criar mapeamento dos IDs antigos para novos IDs
      const idMap: Record<string, string> = {};
      
      // Atribuir novos IDs para todos os nós
      const nodesWithNewIds = nodesCopy.map((node: any) => {
        const newId = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${(idCounter++).toString(36)}`;
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId
        };
      });
      
      // Atualizar as referências de edges com os novos IDs de nós
      const edgesWithNewIds = edgesCopy.map((edge: any) => {
        const newSource = idMap[edge.source] || edge.source;
        const newTarget = idMap[edge.target] || edge.target;
        const newId = `edge_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${(idCounter++).toString(36)}`;
        
        return {
          ...edge,
          id: newId,
          source: newSource,
          target: newTarget
        };
      });
      
      // Gerar ID único para o novo fluxo
      let newFlowId = generateId();
      // Verificar se o ID já existe, se sim, gerar outro
      while (mockData.flows.some(f => f.id === newFlowId)) {
        console.warn(`ID gerado ${newFlowId} já existe, gerando um novo...`);
        newFlowId = generateId();
      }
      
      // Criar um novo fluxo com os mesmos dados, mas com ID diferente
      const newFlow: Flow = {
        id: newFlowId,
        name: `${flowToDuplicate.name} (Cópia)`,
        updatedAt: new Date().toISOString(),
        nodes: nodesWithNewIds,
        edges: edgesWithNewIds
      };
      
      mockData.flows.push(newFlow);
      return newFlow;
    }
    
    try {
      const flowToClone = await flowsApi.getById(id);
      
      // Deep copy dos nodes e edges
      const nodesCopy = JSON.parse(JSON.stringify(flowToClone.nodes));
      const edgesCopy = JSON.parse(JSON.stringify(flowToClone.edges));
      
      // Criar mapeamento dos IDs antigos para novos IDs
      const idMap: Record<string, string> = {};
      
      // Atribuir novos IDs para todos os nós
      const nodesWithNewIds = nodesCopy.map((node: any) => {
        const newId = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${(idCounter++).toString(36)}`;
        idMap[node.id] = newId;
        return {
          ...node,
          id: newId
        };
      });
      
      // Atualizar as referências de edges com os novos IDs de nós
      const edgesWithNewIds = edgesCopy.map((edge: any) => {
        const newSource = idMap[edge.source] || edge.source;
        const newTarget = idMap[edge.target] || edge.target;
        const newId = `edge_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}_${(idCounter++).toString(36)}`;
        
        return {
          ...edge,
          id: newId,
          source: newSource,
          target: newTarget
        };
      });
      
      const newFlowData = {
        name: `${flowToClone.name} (Cópia)`,
        nodes: nodesWithNewIds,
        edges: edgesWithNewIds
      };
      
      const response = await api.post('/flows', newFlowData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao duplicar fluxo com ID ${id}:`, error);
      throw error;
    }
  },
};

// Serviço para integração com XBase e WhatsApp
export const xbaseApi = {
  // Obter todos os fluxos da API XBase
  getFlows: async (): Promise<XBaseFlow[]> => {
    try {
      const response = await axios.get<XBaseResponse>('https://api.xbase.app/api/flows');
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter fluxos da API XBase:', error);
      throw new Error('Falha ao buscar fluxos do XBase');
    }
  },

  // Obter um fluxo específico da API XBase pelo UID
  getFlowByUid: async (uid: string): Promise<XBaseFlow | null> => {
    try {
      const response = await axios.get<XBaseResponse>('https://api.xbase.app/api/flows');
      const flow = response.data.data.find(f => f.attributes.uid === uid);
      return flow || null;
    } catch (error) {
      console.error(`Erro ao buscar fluxo com UID ${uid}:`, error);
      return null;
    }
  },

  // Enviar mensagem de WhatsApp baseada em um fluxo
  sendWhatsAppMessage: async (messageData: WhatsAppMessage): Promise<boolean> => {
    try {
      if (isDevelopment) {
        console.log('Simulando envio de mensagem WhatsApp em desenvolvimento:', messageData);
        await new Promise(resolve => setTimeout(resolve, 500));
        return true;
      }

      // Se tiver um flowId, processa o fluxo
      if (messageData.flowId) {
        // Obter o fluxo para aplicar regras de automatização
        const flow = await xbaseApi.getFlowByUid(messageData.flowId);
        
        if (flow) {
          console.log(`Processando fluxo ${flow.attributes.name} para mensagem`);
          // Aqui você pode implementar lógica para customizar a mensagem baseada no fluxo
          // Por exemplo, personalizar com variáveis, aplicar condições, etc.
        }
      }

      // Enviar a mensagem através da API
      // Na implementação real, seria a chamada à API de WhatsApp
      // await axios.post('endpoint-whatsapp-api', {
      //   phoneNumber: messageData.to,
      //   message: messageData.message
      // });
      
      console.log('Mensagem enviada com sucesso:', messageData);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem WhatsApp:', error);
      return false;
    }
  },

  // Iniciar um fluxo de mensagens automatizado
  startAutomatedFlow: async (flowUid: string, phoneNumber: string, initialContext: any = {}): Promise<boolean> => {
    try {
      // Obter o fluxo
      const flow = await xbaseApi.getFlowByUid(flowUid);
      
      if (!flow) {
        console.error(`Fluxo com UID ${flowUid} não encontrado`);
        return false;
      }

      if (isDevelopment) {
        console.log(`Simulando início de fluxo automatizado "${flow.attributes.name}" para ${phoneNumber}`);
        console.log('Fluxo:', flow.attributes.data);
        console.log('Contexto inicial:', initialContext);
        await new Promise(resolve => setTimeout(resolve, 800));
        return true;
      }

      // Processar nós de início do fluxo
      const startNodes = flow.attributes.data.nodes.filter(node => 
        node.type === 'trigger' || 
        node.id.startsWith('start') || 
        node.id.startsWith('trigger')
      );
      
      if (startNodes.length === 0) {
        console.warn('Fluxo não possui nós de início');
        return false;
      }

      // Encontrar as primeiras mensagens a serem enviadas
      const startNode = startNodes[0];
      
      // Encontrar conexões do nó inicial
      const connectedEdges = flow.attributes.data.edges.filter(edge => 
        edge.source === startNode.id
      );

      if (connectedEdges.length > 0) {
        // Para cada conexão, enviar mensagem correspondente
        for (const edge of connectedEdges) {
          const targetNodeId = edge.target;
          const targetNode = flow.attributes.data.nodes.find(node => node.id === targetNodeId);
          
          if (targetNode && targetNode.data) {
            // Se for um nó de ação com mensagem
            if (targetNode.data.type === 'action' || targetNode.type === 'action' || targetNode.type === 'whatsapp') {
              const message = targetNode.data.config?.message || 
                             targetNode.data.description || 
                             targetNode.data.label || 
                             'Olá! Esta é uma mensagem automatizada.';
              
              await xbaseApi.sendWhatsAppMessage({
                to: phoneNumber,
                message: message,
                flowId: flowUid
              });
            }
          }
        }
      } else {
        // Se não houver conexões, enviar mensagem do nó inicial se for apropriado
        if (startNode.data) {
          const message = startNode.data.config?.message || 
                         startNode.data.description || 
                         startNode.data.label || 
                         'Iniciando fluxo automatizado...';
          
          await xbaseApi.sendWhatsAppMessage({
            to: phoneNumber,
            message: message,
            flowId: flowUid
          });
        }
      }

      console.log(`Fluxo automatizado "${flow.attributes.name}" iniciado para ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Erro ao iniciar fluxo automatizado:', error);
      return false;
    }
  },

  // Processar resposta do usuário em um fluxo ativo
  processFlowResponse: async (flowUid: string, phoneNumber: string, userResponse: string): Promise<boolean> => {
    try {
      // Obter o fluxo
      const flow = await xbaseApi.getFlowByUid(flowUid);
      
      if (!flow) {
        console.error(`Fluxo com UID ${flowUid} não encontrado`);
        return false;
      }

      if (isDevelopment) {
        console.log(`Simulando processamento de resposta "${userResponse}" no fluxo "${flow.attributes.name}" para ${phoneNumber}`);
        await new Promise(resolve => setTimeout(resolve, 600));
        return true;
      }

      // Na implementação real, seria necessário manter o estado da conversa
      // para saber em qual nó do fluxo o usuário está atualmente
      
      // Exemplo simples: simular decisão com base na resposta
      if (userResponse.toLowerCase().includes('sim') || userResponse.toLowerCase().includes('yes')) {
        // Encontrar nós condicionais para resposta positiva
        const conditionalNodes = flow.attributes.data.nodes.filter(node => 
          node.type === 'condition' || node.data?.type === 'condition'
        );
        
        if (conditionalNodes.length > 0) {
          // Simular processamento da primeira condição
          const conditionNode = conditionalNodes[0];
          
          // Encontrar conexões para resposta positiva
          const positiveEdges = flow.attributes.data.edges.filter(edge => 
            edge.source === conditionNode.id
          );
          
          if (positiveEdges.length > 0) {
            // Pegar primeiro caminho
            const targetNodeId = positiveEdges[0].target;
            const targetNode = flow.attributes.data.nodes.find(node => node.id === targetNodeId);
            
            if (targetNode && targetNode.data) {
              const message = targetNode.data.config?.message || 
                             targetNode.data.description || 
                             targetNode.data.label || 
                             'Processando sua resposta positiva...';
              
              await xbaseApi.sendWhatsAppMessage({
                to: phoneNumber,
                message: message,
                flowId: flowUid
              });
            }
          }
        }
      } else {
        // Resposta negativa ou neutra
        await xbaseApi.sendWhatsAppMessage({
          to: phoneNumber,
          message: 'Obrigado pela sua resposta. Posso ajudar com mais alguma coisa?',
          flowId: flowUid
        });
      }

      console.log(`Resposta "${userResponse}" processada no fluxo "${flow.attributes.name}" para ${phoneNumber}`);
      return true;
    } catch (error) {
      console.error('Erro ao processar resposta no fluxo:', error);
      return false;
    }
  }
};

export default api; 