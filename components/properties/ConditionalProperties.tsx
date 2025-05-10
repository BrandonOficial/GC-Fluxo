"use client";

import React, { useState, useEffect } from 'react';
import { useFlow } from '@/lib/providers/FlowProvider';
import { Node } from 'reactflow';

interface ConditionalPropertiesProps {
  node: Node;
}

const ConditionalProperties: React.FC<ConditionalPropertiesProps> = ({ node }) => {
  const { updateNode } = useFlow();
  
  const [condition, setCondition] = useState(node.data?.properties?.condition || '');
  const [variable, setVariable] = useState(node.data?.properties?.variable || '');
  const [operator, setOperator] = useState(node.data?.properties?.operator || 'equal');
  const [value, setValue] = useState(node.data?.properties?.value || '');
  
  useEffect(() => {
    setCondition(node.data?.properties?.condition || '');
    setVariable(node.data?.properties?.variable || '');
    setOperator(node.data?.properties?.operator || 'equal');
    setValue(node.data?.properties?.value || '');
  }, [node.id, node.data?.properties]);
  
  const handleConditionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCondition(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        condition: e.target.value
      }
    });
  };
  
  const handleVariableChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariable(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        variable: e.target.value
      }
    });
  };
  
  const handleOperatorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOperator(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        operator: e.target.value
      }
    });
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    updateNode(node.id, {
      properties: {
        ...node.data.properties,
        value: e.target.value
      }
    });
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-4">Propriedades do Condicional</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Condição
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Descrição da condição"
          value={condition}
          onChange={handleConditionChange}
        />
        <p className="text-xs text-gray-500 mt-1">
          Uma descrição legível da condição
        </p>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variável
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ex: status, idade, país"
          value={variable}
          onChange={handleVariableChange}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Operador
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={operator}
          onChange={handleOperatorChange}
        >
          <option value="equal">É igual a</option>
          <option value="notEqual">Não é igual a</option>
          <option value="contains">Contém</option>
          <option value="greaterThan">Maior que</option>
          <option value="lessThan">Menor que</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Valor
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Valor para comparação"
          value={value}
          onChange={handleValueChange}
        />
      </div>
      
      <div className="bg-gray-50 p-3 rounded-md mt-6">
        <h4 className="text-sm font-medium mb-2">Sobre condicionais</h4>
        <p className="text-xs text-gray-600">
          Os nós condicionais permitem criar caminhos diferentes no seu fluxo com base em condições.
          O caminho "Verdadeiro" é seguido quando a condição é satisfeita, e o "Falso" quando não é.
        </p>
      </div>
    </div>
  );
};

export default ConditionalProperties; 