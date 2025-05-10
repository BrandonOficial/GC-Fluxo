"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { Clock } from 'lucide-react';

const DelayNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Esperar"
      icon={<Clock size={18} />}
      color="#f59e0b"
    />
  );
};

export default DelayNode; 