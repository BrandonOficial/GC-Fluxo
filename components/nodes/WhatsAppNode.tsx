"use client";

import React, { useState } from 'react';
import { NodeProps, Handle, Position } from 'reactflow';
import { MessageSquare, Clock, Settings, Code } from 'lucide-react';
import { useFlow } from '@/lib/providers/FlowProvider';

interface WhatsAppNodeData {
  label: string;
  message: string;
  mediaUrl?: string;
  buttonText?: string;
  customJson?: string;
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

const WhatsAppNode: React.FC<NodeProps<WhatsAppNodeData>> = ({ data, id }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { updateNode } = useFlow();

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  const displayLabel = data.label?.trim() || "Nova Mensagem";

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} />
      
      <div className="bg-white rounded-lg border-2 border-[#25D366] p-3 min-w-[200px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <MessageSquare size={18} className="text-[#25D366] flex-shrink-0" />
            <span className="font-medium text-gray-900 truncate">
              {displayLabel}
            </span>
          </div>
          
          <button 
            onClick={handleSettingsClick}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded flex-shrink-0 ml-2"
          >
            <Settings size={14} className="text-gray-500" />
          </button>
        </div>

        {data.message && (
          <div className="mt-2 text-sm text-gray-600 line-clamp-2 break-words">
            {data.message}
          </div>
        )}

        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          {data.triggers?.afterDelay && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{data.triggers.afterDelay}s</span>
            </div>
          )}
          {data.customJson && (
            <div className="flex items-center gap-1" title="JSON Personalizado">
              <Code size={12} />
              <span>JSON</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default WhatsAppNode; 