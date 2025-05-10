"use client";

import React, { useState, useRef } from 'react';
import { Plus, Settings, Edit, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useFlow } from '@/lib/providers/FlowProvider';

interface Board {
  id: string;
  title: string;
  type: 'whatsapp' | 'wait' | 'conditional' | 'email';
  color: string;
}

const initialBoards: Board[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    type: 'whatsapp',
    color: 'bg-green-600',
  },
  {
    id: 'wait',
    title: 'Espera',
    type: 'wait',
    color: 'bg-yellow-500',
  },
  {
    id: 'conditional',
    title: 'Condição',
    type: 'conditional',
    color: 'bg-purple-500',
  },
  {
    id: 'email',
    title: 'Email',
    type: 'email',
    color: 'bg-blue-500',
  },
];

interface FlowBoardsProps {
  onBoardDrop?: (board: Board, position: { x: number, y: number }) => void;
}

export default function FlowBoards({ onBoardDrop }: FlowBoardsProps) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [draggedBoard, setDraggedBoard] = useState<Board | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const { flowName, setFlowName } = useFlow();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddBoard = () => {
    const newId = uuidv4();
    const newBoard: Board = {
      id: newId,
      title: 'Novo Board',
      type: 'whatsapp',
      color: 'bg-green-600',
    };
    setBoards([...boards, newBoard]);
  };

  const handleFlowNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFlowName(e.target.value);
  };

  const startEditing = () => {
    setIsEditingName(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const stopEditing = () => {
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      stopEditing();
    }
  };

  // Iniciando o drag
  const handleDragStart = (e: React.DragEvent, board: Board) => {
    e.dataTransfer.setData('application/json', JSON.stringify(board));
    setDraggedBoard(board);
    
    // Definir uma imagem fantasma personalizada
    const ghostElement = document.createElement('div');
    ghostElement.classList.add(...board.color.split(' '), 'p-4', 'rounded', 'text-white', 'opacity-80', 'w-40', 'text-center');
    ghostElement.innerText = board.title;
    document.body.appendChild(ghostElement);
    
    // Define a posição como -9999 para não mostrar o elemento
    ghostElement.style.position = 'absolute';
    ghostElement.style.top = '-9999px';
    ghostElement.style.left = '-9999px';
    
    e.dataTransfer.setDragImage(ghostElement, 20, 20);
    
    // Remover o elemento depois que o drag começar
    setTimeout(() => {
      document.body.removeChild(ghostElement);
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedBoard(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          {isEditingName ? (
            <div className="flex w-full">
              <input
                ref={inputRef}
                type="text"
                value={flowName}
                onChange={handleFlowNameChange}
                onBlur={stopEditing}
                onKeyDown={handleKeyDown}
                className="flex-1 border border-gray-300 rounded py-1 px-2 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome do Fluxo"
              />
              <button 
                onClick={stopEditing}
                className="ml-2 p-1 bg-green-500 text-white rounded hover:bg-green-600"
                title="Confirmar"
              >
                <Check size={16} />
              </button>
            </div>
          ) : (
            <div 
              className="flex items-center cursor-pointer group"
              onClick={startEditing}
            >
              <h2 className="text-lg font-semibold">{flowName}</h2>
              <Edit size={16} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-500" />
            </div>
          )}
        </div>
        <button 
          onClick={handleAddBoard}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Adicionar Board
        </button>
      </div>

      <div className="flex-1 p-4 space-y-2 overflow-y-auto">
        {boards.map((board) => (
          <div
            key={board.id}
            draggable
            onDragStart={(e) => handleDragStart(e, board)}
            onDragEnd={handleDragEnd}
            className={`${board.color} text-white p-4 rounded-lg shadow-md cursor-move`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{board.title}</span>
              <button className="hover:bg-white/10 p-1 rounded">
                <Settings size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 