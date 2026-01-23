import { FC, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Trash2, Plus, CheckCircle2 } from 'lucide-react';
import { useAllyGPT, ChatMessage, AllyGPTAction } from '@/hooks/useAllyGPT';
import { cn } from '@/lib/utils';

interface ProjectContext {
  id: string;
  name: string;
  category: string;
}

interface AllyGPTChatProps {
  isOpen: boolean;
  onClose: () => void;
  projectContext: ProjectContext | null;
  onCreateGoal: (goal: { name: string; category: string }, tasks: string[]) => Promise<void>;
  onAddTasks: (projectId: string, tasks: string[]) => Promise<void>;
}

export const AllyGPTChat: FC<AllyGPTChatProps> = ({
  isOpen,
  onClose,
  projectContext,
  onCreateGoal,
  onAddTasks,
}) => {
  const { messages, isLoading, error, sendMessage, clearHistory } = useAllyGPT(projectContext);
  const [input, setInput] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleAction = async (action: AllyGPTAction, messageId: string) => {
    setActionInProgress(messageId);
    try {
      if (action.type === 'goal' && action.goal) {
        await onCreateGoal(action.goal, action.tasks || []);
        onClose();
      } else if (action.type === 'tasks' && action.tasks && projectContext) {
        await onAddTasks(projectContext.id, action.tasks);
        onClose();
      }
    } catch (e) {
      console.error('Action error:', e);
    } finally {
      setActionInProgress(null);
    }
  };

  const getActionButton = (message: ChatMessage) => {
    if (!message.action) return null;
    
    const isProcessing = actionInProgress === message.id;
    const action = message.action;

    if (action.type === 'goal' && action.goal) {
      return (
        <button
          onClick={() => handleAction(action, message.id)}
          disabled={isProcessing}
          className="mt-3 flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          Crear esta meta
        </button>
      );
    }

    if (action.type === 'tasks' && action.tasks && projectContext) {
      return (
        <button
          onClick={() => handleAction(action, message.id)}
          disabled={isProcessing}
          className="mt-3 flex items-center gap-2 bg-primary text-primary-foreground font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <CheckCircle2 size={16} />
          )}
          Agregar estas tareas
        </button>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border flex flex-col"
            style={{ height: '85vh', maxHeight: '700px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Sparkles size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">AllyGPT</h2>
                  <p className="text-xs text-muted-foreground">
                    {projectContext ? `Meta: ${projectContext.name}` : 'Tu asistente de metas'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Limpiar historial"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles size={28} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">¡Hola! Soy AllyGPT</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Contame qué meta querés lograr y te ayudo a dividirla en tareas simples.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      'Quiero empezar a hacer ejercicio',
                      'Necesito ahorrar dinero',
                      'Quiero aprender un idioma nuevo',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => sendMessage(suggestion)}
                        className="text-xs px-3 py-2 rounded-lg bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-foreground'
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.role === 'assistant' && getActionButton(message)}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Pensando...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribí tu mensaje..."
                  disabled={isLoading}
                  className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
