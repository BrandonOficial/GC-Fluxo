"use client";

import StartNode from './StartNode';
import SendMessageNode from './SendMessageNode';
import DelayNode from './DelayNode';
import ConditionalNode from './ConditionalNode';
import SendEmailNode from './SendEmailNode';

export const nodeTypes = {
  start: StartNode,
  sendMessage: SendMessageNode,
  delay: DelayNode,
  conditional: ConditionalNode,
  sendEmail: SendEmailNode
}; 