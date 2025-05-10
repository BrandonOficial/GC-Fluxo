"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { MessageSquare } from 'lucide-react';

const WhatsAppNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Mensagem WhatsApp"
      icon={<MessageSquare size={18} />}
      color="#25D366"
    />
  );
};

export default WhatsAppNode; 