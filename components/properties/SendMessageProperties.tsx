"use client";

import React, { useState, useEffect } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';
import { Node } from 'reactflow';

interface SendMessagePropertiesProps {
  node: Node;
}

const SendMessageProperties: React.FC<SendMessagePropertiesProps> = ({ node }) => {
  const { updateNode } = useFlow();
  
  const [message, setMessage] = useState(node.data?.properties?.message || '');
  const [mediaUrl, setMediaUrl] = useState(node.data?.properties?.mediaUrl || '');
  const [buttonText, setButtonText] = useState(node.data?.properties?.buttonText || '');
  
  useEffect(() => {
    setMessage(node.data?.properties?.message || '');
    setMediaUrl(node.data?.properties?.mediaUrl || '');
    setButtonText(node.data?.properties?.buttonText || '');
  }, [node.id, node.data?.properties]);
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        message: e.target.value
      }
    });
  };
  
  const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMediaUrl(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        mediaUrl: e.target.value
      }
    });
  };
  
  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setButtonText(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        buttonText: e.target.value
      }
    });
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Propriedades da Mensagem</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mensagem
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={5}
          placeholder="Digite a mensagem que será enviada..."
          value={message}
          onChange={handleMessageChange}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL da Mídia (opcional)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://exemplo.com/imagem.jpg"
          value={mediaUrl}
          onChange={handleMediaUrlChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          URL para uma imagem, vídeo ou áudio que será enviado com a mensagem
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texto do Botão (opcional)
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Clique aqui"
          value={buttonText}
          onChange={handleButtonTextChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          Se preenchido, adiciona um botão à mensagem
        </p>
      </div>
    </div>
  );
};

export default SendMessageProperties; 