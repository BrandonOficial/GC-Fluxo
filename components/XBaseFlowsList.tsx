"use client";

import React, { useState, useEffect, useRef } from "react";
import { xbaseApi } from "@/lib/api";
import { 
  ArrowRight, Check, RefreshCw, MessageSquare, Phone, Info,
  AlertTriangle, X, Copy, ExternalLink, Smartphone
} from "lucide-react";

interface XBaseFlow {
  id: number;
  attributes: {
    name: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    billing: string;
    published: boolean;
    uid: string;
    data: {
      edges: any[];
      nodes: any[];
    };
  };
}

export default function XBaseFlowsList() {
  const [flows, setFlows] = useState<XBaseFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<XBaseFlow | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const flowsData = await xbaseApi.getFlows();
      setFlows(flowsData);
    } catch (err) {
      console.error("Erro ao buscar fluxos:", err);
      setError("Não foi possível carregar os fluxos. Tente novamente mais tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFlow = (flow: XBaseFlow) => {
    setSelectedFlow(flow);
    setSuccessMessage(null);
    
    // Verificar se o fluxo é válido para WhatsApp
    const hasWhatsAppNodes = flow.attributes.data?.nodes?.some(
      node => node.type === 'whatsapp' || 
             node.id?.includes('whatsapp') || 
             node.data?.app === 'whatsapp'
    );
    
    if (!hasWhatsAppNodes) {
      setError("Este fluxo não parece ter integração com WhatsApp. A automação pode não funcionar corretamente.");
    } else {
      setError(null);
    }
    
    // Focar no campo de telefone
    setTimeout(() => {
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
      }
    }, 100);
  };

  const handleStartFlow = async () => {
    if (!selectedFlow || !phoneNumber.trim()) {
      setError("Selecione um fluxo e informe um número de telefone válido.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      
      // Iniciar o fluxo automatizado
      const success = await xbaseApi.startAutomatedFlow(
        selectedFlow.attributes.uid,
        phoneNumber,
        { source: 'webapp' }
      );
      
      if (success) {
        setSuccessMessage(`Fluxo "${selectedFlow.attributes.name}" iniciado com sucesso para ${phoneNumber}`);
        // Limpar campos
        setTestMessage("");
      } else {
        setError("Não foi possível iniciar o fluxo automatizado. Verifique os dados e tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao iniciar fluxo:", err);
      setError("Ocorreu um erro ao iniciar o fluxo. Tente novamente mais tarde.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!selectedFlow || !phoneNumber.trim() || !testMessage.trim()) {
      setError("Preencha todos os campos para enviar uma mensagem de teste.");
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      
      // Enviar mensagem de teste
      const success = await xbaseApi.sendWhatsAppMessage({
        to: phoneNumber,
        message: testMessage,
        flowId: selectedFlow.attributes.uid
      });
      
      if (success) {
        setSuccessMessage(`Mensagem de teste enviada com sucesso para ${phoneNumber}`);
      } else {
        setError("Não foi possível enviar a mensagem de teste. Verifique os dados e tente novamente.");
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem de teste:", err);
      setError("Ocorreu um erro ao enviar a mensagem. Tente novamente mais tarde.");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getFlowStatusBadge = (status: string) => {
    const statusClasses = {
      published: "bg-green-100 text-green-800 border-green-300",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      default: "bg-gray-100 text-gray-800 border-gray-300"
    };

    const statusClass = statusClasses[status as keyof typeof statusClasses] || statusClasses.default;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${statusClass}`}>
        {status === "published" ? "Publicado" : status === "draft" ? "Rascunho" : status}
      </span>
    );
  };

  const filteredFlows = flows.filter(flow => 
    flow.attributes.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flow.attributes.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Integração XBase - WhatsApp</h1>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Buscar fluxos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <button
            onClick={fetchFlows}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors ml-4"
          >
            <RefreshCw size={16} className="mr-2" />
            Atualizar
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <RefreshCw className="animate-spin text-blue-500 h-8 w-8" />
          </div>
        ) : error && !selectedFlow ? (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
            <button
              className="absolute top-0 right-0 mt-3 mr-3"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : filteredFlows.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Info className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {searchTerm ? "Nenhum fluxo encontrado" : "Nenhum fluxo disponível"}
            </h3>
            {searchTerm && (
              <p className="text-gray-500 mb-4">
                Tente usar outros termos de busca ou{" "}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setSearchTerm("")}
                >
                  limpar a busca
                </button>
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredFlows.map((flow) => (
              <div
                key={flow.id}
                className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                  selectedFlow?.id === flow.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => handleSelectFlow(flow)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg truncate max-w-[80%]">
                      {flow.attributes.name || "Sem nome"}
                    </h3>
                    {getFlowStatusBadge(flow.attributes.status)}
                  </div>
                  <p className="text-gray-500 text-sm mb-3">
                    ID: {flow.attributes.uid || "N/A"}
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    Atualizado em: {formatDate(flow.attributes.updatedAt)}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm">
                      <span className="text-gray-600">
                        {flow.attributes.data?.nodes?.length || 0} nós · {flow.attributes.data?.edges?.length || 0} conexões
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="p-1 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(flow.attributes.uid || "");
                          alert("UID copiado para a área de transferência!");
                        }}
                        title="Copiar UID"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        className="p-1 text-blue-400 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`https://xbase.app/flows/${flow.attributes.uid}`, "_blank");
                        }}
                        title="Abrir no XBase"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-2 border-t flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {flow.attributes.billing || "free"}
                  </span>
                  <button
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectFlow(flow);
                    }}
                  >
                    Integrar <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedFlow && (
        <div className="bg-white border rounded-lg shadow-sm p-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Integrar "{selectedFlow.attributes.name}"
            </h2>
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedFlow(null)}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>{error}</span>
              </div>
              <button
                className="absolute top-0 right-0 mt-3 mr-3"
                onClick={() => setError(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded relative mb-4">
              <div className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                <span>{successMessage}</span>
              </div>
              <button
                className="absolute top-0 right-0 mt-3 mr-3"
                onClick={() => setSuccessMessage(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="phone">
              Número de Telefone
            </label>
            <div className="flex">
              <div className="flex items-center bg-gray-100 rounded-l px-3 border border-r-0 border-gray-300">
                <Phone size={16} className="text-gray-500" />
              </div>
              <input
                id="phone"
                ref={phoneInputRef}
                type="text"
                placeholder="5511999999999"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">Digite apenas números, incluindo o código do país (Ex: 5511999999999)</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="message">
              Mensagem de Teste (opcional)
            </label>
            <div className="flex">
              <div className="flex items-center bg-gray-100 rounded-l px-3 border border-r-0 border-gray-300">
                <MessageSquare size={16} className="text-gray-500" />
              </div>
              <textarea
                id="message"
                placeholder="Digite uma mensagem de teste..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-r focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleStartFlow}
              disabled={isSending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSending ? (
                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Smartphone className="h-5 w-5 mr-2" />
              )}
              Iniciar Fluxo
            </button>
            
            {testMessage && (
              <button
                onClick={handleSendTestMessage}
                disabled={isSending}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSending ? (
                  <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <MessageSquare className="h-5 w-5 mr-2" />
                )}
                Enviar Mensagem Teste
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 