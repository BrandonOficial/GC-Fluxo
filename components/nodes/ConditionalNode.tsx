"use client";

import React from 'react';
import { NodeProps } from 'reactflow';
import BaseNode from './BaseNode';
import { GitBranch } from 'lucide-react';

const ConditionalNode: React.FC<NodeProps> = (props) => {
  return (
    <BaseNode 
      {...props} 
      title="Condição"
      icon={<GitBranch size={18} />}
      color="#8b5cf6"
    />
  );
};

export default ConditionalNode; 