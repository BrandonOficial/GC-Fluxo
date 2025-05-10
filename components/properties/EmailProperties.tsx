"use client";

import React, { useState, useEffect } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';

interface EmailPropertiesProps {
  nodeId: string;
  data: any;
}

const EmailProperties: React.FC<EmailPropertiesProps> = ({ nodeId, data }) => {
  const { updateNode } = useFlow();
  
  const [subject, setSubject] = useState(data?.properties?.subject || '');
  const [recipient, setRecipient] = useState(data?.properties?.recipient || '');
  const [content, setContent] = useState(data?.properties?.content || '');
  
  useEffect(() => {
    setSubject(data?.properties?.subject || '');
    setRecipient(data?.properties?.recipient || '');
    setContent(data?.properties?.content || '');
  }, [nodeId, data?.properties]);
  
  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubject(e.target.value);
    updateNode(nodeId, {
      properties: {
        ...data.properties,
        subject: e.target.value
      }
    });
  };
  
  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    updateNode(nodeId, {
      properties: {
        ...data.properties,
        recipient: e.target.value
      }
    });
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    updateNode(nodeId, {
      properties: {
        ...data.properties,
        content: e.target.value
      }
    });
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Propriedades do Email</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Destinatário
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="email@exemplo.com"
          value={recipient}
          onChange={handleRecipientChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          Email do destinatário ou variável com o email
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Assunto
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Assunto do email"
          value={subject}
          onChange={handleSubjectChange}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={8}
          placeholder="Conteúdo do email..."
          value={content}
          onChange={handleContentChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          Você pode usar HTML básico para formatação
        </p>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mt-6">
        <h4 className="text-sm font-medium mb-2">Sobre emails</h4>
        <p className="text-xs text-gray-600">
          Os nós de email permitem enviar mensagens formais para seus clientes.
          Ideal para confirmações, relatórios ou comunicações mais detalhadas.
        </p>
      </div>
    </div>
  );
};

export default EmailProperties; 