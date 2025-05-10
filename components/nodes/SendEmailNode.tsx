"use client";

import React from 'react';
import BaseNode from './BaseNode';
import { Mail } from 'lucide-react';

const SendEmailNode = ({ id, data }: { id: string; data: any }) => {
  return (
    <BaseNode
      id={id}
      data={{
        ...data,
        label: data.label || 'Enviar Email'
      }}
      title={data.label || 'Enviar Email'}
      icon={<Mail size={18} className="text-blue-500" />}
      color="text-blue-500 bg-blue-50 dark:bg-blue-900/20"
    />
  );
};

export default SendEmailNode; 