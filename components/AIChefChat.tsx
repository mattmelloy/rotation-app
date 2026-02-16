import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, ChefHat, User, Bot, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChefChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChefChat: React.FC<AIChefChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        // Small delay to allow rendering before scroll
        setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage: Message = { role: 'model', text: data.text };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the kitchen right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Chat Window */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-surface w-full max-w-md h-[600px] max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative z-10 border border-border"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-4 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-md">
                   <Sparkles size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-lg leading-tight">AI Chef</h3>
                    <p className="text-[10px] text-white/80 font-medium">Ask me anything about cooking!</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50/50 dark:bg-neutral-900/50 custom-scrollbar">
               {messages.length === 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="h-full flex flex-col items-center justify-center text-center text-secondary p-8"
                 >
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center shadow-sm mb-4">
                        <ChefHat size={32} className="text-primary-400" />
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">Welcome to your personal kitchen assistant!</p>
                    <p className="text-xs text-secondary">Ask for recipes, cooking tips, or ingredient substitutions.</p>
                 </motion.div>
               )}
               
               {messages.map((msg, idx) => (
                 <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                 >
                    <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            msg.role === 'user' ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-600'
                        }`}
                    >
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    
                    <div 
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-primary-600 text-white rounded-tr-none' 
                                : 'bg-surface border border-border text-primary rounded-tl-none'
                        }`}
                    >
                        {msg.text}
                    </div>
                 </motion.div>
               ))}

               {isLoading && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="flex gap-3"
                 >
                    <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center flex-shrink-0">
                        <Bot size={14} />
                    </div>
                    <div className="bg-surface border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                    </div>
                 </motion.div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-surface border-t border-border shrink-0">
                <form 
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="How do I make a risotto?"
                        className="input flex-1"
                        disabled={isLoading}
                    />
                    <motion.button
                        type="submit"
                        disabled={!inputText.trim() || isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </motion.button>
                </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIChefChat;
