"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GitGraph, List, Settings, MessageSquare } from 'lucide-react';
import { useFlow } from '@/lib/providers/FlowProvider';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { flowId, flowName } = useFlow();
  
  return (
    <nav className="fixed top-0 left-0 right-0 bg-card border-b border-border z-50 h-14 flex items-center px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <GitGraph size={24} className="text-primary mr-2" />
          <span className="font-semibold text-xl">Funil de Vendas</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link
            href="/flows"
            className={`flex items-center gap-2 py-1 px-3 rounded-md transition-colors ${
              pathname === '/flows' 
                ? 'bg-secondary text-secondary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <List size={18} />
            <span>Meus Fluxos</span>
          </Link>
          
          <Link
            href="/"
            className={`flex items-center gap-2 py-1 px-3 rounded-md transition-colors ${
              pathname === '/' 
                ? 'bg-secondary text-secondary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <GitGraph size={18} />
            <span>Editor{flowName ? ` - ${flowName}` : ''}</span>
          </Link>

          <Link
            href="/integration"
            className={`flex items-center gap-2 py-1 px-3 rounded-md transition-colors ${
              pathname === '/integration' 
                ? 'bg-secondary text-secondary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <MessageSquare size={18} />
            <span>WhatsApp</span>
          </Link>

          <button 
            className="ml-2 p-2 rounded-full hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            title="Configurações"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 