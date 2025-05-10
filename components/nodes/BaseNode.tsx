"use client";

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { useFlow } from '@/lib/providers/FlowProvider';
import { X } from 'lucide-react';

export interface BaseNodeProps {
  id: string;
  data: any;
  selected?: boolean;
  title?: string;
  icon?: React.ReactNode;
  inputs?: number;
  outputs?: number;
  color?: string;
}

const BaseNode: React.FC<BaseNodeProps> = ({ 
  id, 
  data, 
  selected,
  title = data.label,
  icon,
  inputs = 1,
  outputs = 1,
  color = 'text-primary bg-primary/10',
}) => {
  const { removeNode } = useFlow();
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o clique propague para o nó
    removeNode(id);
  };
  
  return (
    <div 
      className={`rounded-md p-3 shadow-md border-2 transition-colors ${
        selected 
          ? 'border-primary' 
          : 'border-border'
      } ${
        selected 
          ? 'bg-primary/5 dark:bg-primary/10' 
          : 'bg-card dark:bg-card/80'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {icon && (
            <div className={`mr-2 flex-shrink-0 ${color}`}>
              {icon}
            </div>
          )}
          <div className="font-medium text-sm">{title}</div>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 hover:bg-red-100 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          title="Excluir nó"
        >
          <X size={14} className="text-red-500" />
        </button>
      </div>
      
      {inputs > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-primary"
        />
      )}
      
      {outputs > 0 && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 bg-primary"
        />
      )}
    </div>
  );
};

export default memo(BaseNode); 