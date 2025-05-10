"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { Clock } from 'lucide-react';

const WaitNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Espera"
      icon={<Clock size={18} />}
      color="#f59e0b"
    />
  );
};

export default WaitNode; 