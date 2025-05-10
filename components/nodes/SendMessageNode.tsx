"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { MessageSquare } from 'lucide-react';

const SendMessageNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Enviar Mensagem"
      icon={<MessageSquare size={18} />}
      color="#0ea5e9"
    />
  );
};

export default SendMessageNode; 