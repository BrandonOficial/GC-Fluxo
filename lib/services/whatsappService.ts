import { Node, Edge } from 'reactflow';
import { xbaseApi } from '../api';
import { WhatsAppConfigService } from './whatsappConfigService';

interface WhatsAppNodeData {
  label: string;
  message: string;
  mediaUrl?: string;
  buttonText?: string;
  triggers?: {
    onResponse?: string;
    afterDelay?: number;
    condition?: string;
  };
  actions?: {
    sendMessage?: boolean;
    waitForResponse?: boolean;
    executeCondition?: boolean;
  };
}

export class WhatsAppService {
  private nodes: Node<WhatsAppNodeData>[];
  private edges: Edge[];
  private flowId: string;

  constructor(nodes: Node<WhatsAppNodeData>[], edges: Edge[], flowId: string) {
    this.nodes = nodes;
    this.edges = edges;
    this.flowId = flowId;
  }

  async processNode(nodeId: string, phoneNumber: string, context: any = {}) {
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return null;

    try {
      // Processar ações do nó
      if (node.data.actions?.sendMessage) {
        await this.sendMessage(node.data, phoneNumber);
      }

      // Processar gatilhos
      if (node.data.triggers?.afterDelay) {
        await this.handleDelay(node.data.triggers.afterDelay);
      }

      if (node.data.actions?.waitForResponse) {
        return {
          waitingForResponse: true,
          expectedResponse: node.data.triggers?.onResponse,
          nextNodeId: this.getNextNodeId(nodeId)
        };
      }

      if (node.data.actions?.executeCondition && node.data.triggers?.condition) {
        const conditionMet = await this.evaluateCondition(node.data.triggers.condition, context);
        return {
          conditionMet,
          nextNodeId: this.getNextNodeId(nodeId, conditionMet)
        };
      }

      return {
        nextNodeId: this.getNextNodeId(nodeId)
      };
    } catch (error) {
      console.error('Erro ao processar nó WhatsApp:', error);
      throw error;
    }
  }

  private async sendMessage(data: WhatsAppNodeData, phoneNumber: string) {
    let message = data.message;

    if (data.mediaUrl) {
      message = `${data.mediaUrl}\n\n${message}`;
    }

    if (data.buttonText) {
      message = `${message}\n\n[${data.buttonText}]`;
    }

    // Obter configurações do WhatsApp
    const config = await WhatsAppConfigService.getConfig();
    if (!config) {
      throw new Error('Configurações do WhatsApp não encontradas');
    }

    return await xbaseApi.sendWhatsAppMessage({
      to: phoneNumber,
      message,
      flowId: this.flowId,
      from: config.phoneNumber,
      webhookUrl: config.webhookUrl
    });
  }

  private async handleDelay(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  private async evaluateCondition(condition: string, context: any) {
    try {
      // Aqui você pode implementar uma lógica mais complexa de avaliação
      // Por enquanto, vamos fazer uma avaliação simples
      const fn = new Function('context', `return ${condition}`);
      return fn(context);
    } catch (error) {
      console.error('Erro ao avaliar condição:', error);
      return false;
    }
  }

  private getNextNodeId(currentNodeId: string, conditionMet: boolean = true): string | null {
    const outgoingEdges = this.edges.filter(edge => edge.source === currentNodeId);
    
    if (outgoingEdges.length === 0) return null;
    
    if (outgoingEdges.length === 1) return outgoingEdges[0].target;
    
    // Se houver mais de uma aresta e estamos avaliando uma condição
    if (conditionMet) {
      // Pegar a primeira aresta (caminho verdadeiro)
      return outgoingEdges[0].target;
    } else {
      // Pegar a segunda aresta (caminho falso)
      return outgoingEdges[1]?.target || null;
    }
  }

  async executeFlow(phoneNumber: string, context: any = {}) {
    const startNode = this.nodes.find(node => 
      !this.edges.some(edge => edge.target === node.id)
    );

    if (!startNode) {
      throw new Error('Nó inicial não encontrado no fluxo');
    }

    let currentNodeId = startNode.id;
    let flowContext = { ...context };

    while (currentNodeId) {
      const result = await this.processNode(currentNodeId, phoneNumber, flowContext);
      
      if (!result) break;

      if (result.waitingForResponse) {
        return {
          status: 'waiting_response',
          expectedResponse: result.expectedResponse,
          nextNodeId: result.nextNodeId
        };
      }

      currentNodeId = result.nextNodeId;
    }

    return { status: 'completed' };
  }
} 