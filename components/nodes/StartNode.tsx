"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { Play } from 'lucide-react';

const StartNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Início do Fluxo"
      icon={<Play size={18} />}
      inputs={0}
      outputs={1}
      color="#22c55e"
    />
  );
};

export default StartNode; 