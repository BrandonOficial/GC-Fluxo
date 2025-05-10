"use client";

import React, { useState, useEffect } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';
import { Node } from 'reactflow';

interface DelayPropertiesProps {
  node: Node;
}

const DelayProperties: React.FC<DelayPropertiesProps> = ({ node }) => {
  const { updateNode } = useFlow();
  
  const [duration, setDuration] = useState(node.data?.properties?.duration || '');
  const [durationType, setDurationType] = useState(node.data?.properties?.durationType || 'minutes');
  
  useEffect(() => {
    setDuration(node.data?.properties?.duration || '');
    setDurationType(node.data?.properties?.durationType || 'minutes');
  }, [node.id, node.data?.properties]);
  
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        duration: e.target.value
      }
    });
  };
  
  const handleDurationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDurationType(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        durationType: e.target.value
      }
    });
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Propriedades de Espera</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Duração
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Duração"
            value={duration}
            onChange={handleDurationChange}
            min="1"
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={durationType}
            onChange={handleDurationTypeChange}
          >
            <option value="minutes">Minutos</option>
            <option value="hours">Horas</option>
            <option value="days">Dias</option>
          </select>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mt-6">
        <h4 className="text-sm font-medium mb-2">Sobre esperas</h4>
        <p className="text-xs text-gray-600">
          Os nós de espera permitem adicionar um intervalo de tempo entre as ações no seu fluxo.
          Por exemplo, você pode esperar 2 horas após enviar uma mensagem antes de enviar a próxima.
        </p>
      </div>
    </div>
  );
};

export default DelayProperties; 