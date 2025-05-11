import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formatação de datas
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
};

// Função para verificar se um fluxo é válido (tem início e fim, sem nós soltos)
export const validateFlow = (nodes: any[], edges: any[]) => {
  const errors = [];
  
  // Verificar se existe um nó de início
  const startNode = nodes.find(node => node.type === 'start');
  if (!startNode) {
    errors.push('O fluxo deve ter um nó de início.');
  }
  
  // Verificar se todos os nós têm pelo menos uma conexão (exceto os últimos nós)
  const nodesWithoutConnections = nodes.filter(node => {
    // Ignorar o nó de início para verificação de entrada
    const hasInput = node.type === 'start' || edges.some(edge => edge.target === node.id);
    // Verificar se tem saída (não é necessário para nós finais como sendMessage ou sendEmail)
    const hasOutput = edges.some(edge => edge.source === node.id);
    const requiresOutput = !['sendMessage', 'sendEmail'].includes(node.type);
    
    // Um nó é válido se tem entrada E (tem saída OU não precisa de saída)
    return !(hasInput && (hasOutput || !requiresOutput));
  });
  
  if (nodesWithoutConnections.length > 0) {
    errors.push(`Existem ${nodesWithoutConnections.length} nós desconectados ou mal configurados no fluxo.`);
  }
  
  // Verificar propriedades obrigatórias dos nós
  nodes.forEach(node => {
    const { type, data, id } = node;
    
    switch (type) {
      case 'sendMessage':
        if (!data?.properties?.message) {
          errors.push(`O nó de mensagem "${data.label}" (${id}) não tem uma mensagem definida.`);
        }
        break;
      case 'sendEmail':
        if (!data?.properties?.recipient) {
          errors.push(`O nó de email "${data.label}" (${id}) não tem um destinatário definido.`);
        }
        if (!data?.properties?.subject) {
          errors.push(`O nó de email "${data.label}" (${id}) não tem um assunto definido.`);
        }
        break;
      case 'conditional':
        if (!data?.properties?.condition) {
          errors.push(`O nó condicional "${data.label}" (${id}) não tem uma condição definida.`);
        }
        break;
      case 'delay':
        if (!data?.properties?.duration) {
          errors.push(`O nó de espera "${data.label}" (${id}) não tem uma duração definida.`);
        }
        break;
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
