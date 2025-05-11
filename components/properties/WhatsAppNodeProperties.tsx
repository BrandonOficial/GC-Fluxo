import React, { useState, useEffect } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';
import { AlertCircle } from 'lucide-react';

interface WhatsAppNodePropertiesProps {
  nodeId: string;
  data: {
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
    customJson?: string;
  };
}

const WhatsAppNodeProperties: React.FC<WhatsAppNodePropertiesProps> = ({
  nodeId,
  data
}) => {
  const { updateNode } = useFlow();
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [localLabel, setLocalLabel] = useState(data.label || '');

  useEffect(() => {
    setLocalLabel(data.label || '');
  }, [data.label]);

  const handleChange = (field: string, value: any) => {
    const updatedData = {
      ...data,
      [field]: value
    };
    updateNode(nodeId, updatedData);
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLocalLabel(newLabel);
    handleChange('label', newLabel.trim() || 'Nova Mensagem');
  };

  const handleTriggerChange = (field: string, value: any) => {
    updateNode(nodeId, {
      ...data,
      triggers: {
        ...data.triggers,
        [field]: value
      }
    });
  };

  const handleActionChange = (field: string, value: boolean) => {
    updateNode(nodeId, {
      ...data,
      actions: {
        ...data.actions,
        [field]: value
      }
    });
  };

  const handleJsonChange = (value: string) => {
    try {
      // Tenta fazer o parse do JSON para validar
      JSON.parse(value);
      setJsonError(null);
      handleChange('customJson', value);
    } catch (error) {
      setJsonError('JSON inválido');
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Seção Básica */}
      <div className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Título do Nó
          </label>
          <div className="relative">
            <input
              type="text"
              value={localLabel}
              onChange={handleLabelChange}
              onBlur={() => {
                if (!localLabel.trim()) {
                  setLocalLabel('Nova Mensagem');
                  handleChange('label', 'Nova Mensagem');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
              placeholder="Digite um título..."
            />
            {!localLabel && (
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                Obrigatório
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Este título será exibido no topo do nó
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Mensagem
          </label>
          <textarea
            value={data.message}
            onChange={(e) => handleChange('message', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Digite a mensagem..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            URL da Mídia
            <span className="text-gray-500 font-normal ml-1">(opcional)</span>
          </label>
          <input
            type="text"
            value={data.mediaUrl}
            onChange={(e) => handleChange('mediaUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">
            Texto do Botão
            <span className="text-gray-500 font-normal ml-1">(opcional)</span>
          </label>
          <input
            type="text"
            value={data.buttonText}
            onChange={(e) => handleChange('buttonText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Clique aqui"
          />
        </div>
      </div>

      {/* Seção JSON */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">JSON Personalizado</h3>
        <div>
          <textarea
            value={data.customJson || ''}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={6}
            placeholder={"{\n  \"chave\": \"valor\"\n}"}
          />
          {jsonError && (
            <div className="flex items-center gap-2 text-red-500 mt-1 text-sm">
              <AlertCircle size={16} />
              <span>{jsonError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Seção Gatilhos */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Gatilhos</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Aguardar Resposta
            </label>
            <input
              type="text"
              value={data.triggers?.onResponse}
              onChange={(e) => handleTriggerChange('onResponse', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Palavra-chave esperada..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Atraso
              <span className="text-gray-500 font-normal ml-1">(em segundos)</span>
            </label>
            <input
              type="number"
              value={data.triggers?.afterDelay}
              onChange={(e) => handleTriggerChange('afterDelay', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Condição
            </label>
            <input
              type="text"
              value={data.triggers?.condition}
              onChange={(e) => handleTriggerChange('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Condição para execução..."
            />
          </div>
        </div>
      </div>

      {/* Seção Ações */}
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ações</h3>
        <div className="space-y-3">
          <label className="flex items-center space-x-3 text-gray-700">
            <input
              type="checkbox"
              checked={data.actions?.sendMessage}
              onChange={(e) => handleActionChange('sendMessage', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm">Enviar mensagem automaticamente</span>
          </label>

          <label className="flex items-center space-x-3 text-gray-700">
            <input
              type="checkbox"
              checked={data.actions?.waitForResponse}
              onChange={(e) => handleActionChange('waitForResponse', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm">Aguardar resposta</span>
          </label>

          <label className="flex items-center space-x-3 text-gray-700">
            <input
              type="checkbox"
              checked={data.actions?.executeCondition}
              onChange={(e) => handleActionChange('executeCondition', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
            />
            <span className="text-sm">Executar condição</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppNodeProperties; 