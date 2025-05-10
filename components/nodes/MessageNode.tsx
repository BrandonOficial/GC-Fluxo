'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';
import { MessageSquare } from 'lucide-react';
import { useFlow } from '@/lib/providers/FlowProvider';

interface MessageNodeProps {
  data: {
    label: string;
    message?: string;
  };
  id: string;
}

export function MessageNode({ data, id }: MessageNodeProps) {
  const { updateNode } = useFlow();
  
  const handleClick = () => {
    updateNode(id, data);
  };
  
  return (
    <div 
      className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500"
      onClick={handleClick}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="flex items-center gap-2">
        <MessageSquare className="text-blue-500" size={16} />
        <div className="flex flex-col">
          <div className="font-bold">{data.label}</div>
          {data.message && (
            <div className="text-sm text-gray-500">{data.message}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
} 