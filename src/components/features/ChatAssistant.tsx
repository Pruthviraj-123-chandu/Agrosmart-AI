import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Bot, User, Loader2, Sparkles, X, Mic, Volume2, Trash2, Square } from 'lucide-react';
import { agriculturalChat } from '../../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

interface Message {
  role: 'user' | 'model';
  content: string;
}

export function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your AgroSmart Assistant. How can I help you with your farming today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setLoading(false);
      setMessages(prev => [...prev.slice(0, -1), { role: 'model', content: "— *Response stopped by user* —" }]);
    }
  };

  const handleClear = () => {
    setMessages([
      { role: 'model', content: "Hello! I'm your AgroSmart Assistant. How can I help you with your farming today?" }
    ]);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await agriculturalChat(messages, userMessage, controller.signal);
      if (typeof response === 'object' && (response as any).error) {
        const errorData = response as any;
        if (errorData.code === 'QUOTA_EXCEEDED') {
           setMessages(prev => [...prev, { role: 'model', content: "⚠️ **AI Quota Exceeded**: I'm receiving too many requests. Please wait a minute and then try asking again. Thank you for your patience!" }]);
        } else {
           setMessages(prev => [...prev, { role: 'model', content: errorData.error || "I'm sorry, I couldn't process that." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: response || "I'm sorry, I couldn't process that." }]);
      }
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Something went wrong. Please check your connection." }]);
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };
      recognition.start();
    } else {
      alert("Speech recognition not supported in this browser.");
    }
  };

  const handleTTS = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-180px)] flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">AI Assistant</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ask anything about crops, fertilizers, or pests.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-full border border-green-100 dark:border-green-900">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Active Assistant</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-green-50 dark:border-slate-800 overflow-hidden flex flex-col relative">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-slate-900 text-white" : "bg-green-600 text-white"
              )}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "p-6 rounded-[2rem] relative group",
                msg.role === 'user' 
                  ? "bg-slate-900 dark:bg-green-600 text-slate-100 rounded-tr-none" 
                  : "bg-green-50/50 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tl-none border border-green-100 dark:border-slate-700"
              )}>
                <div className={cn(
                  "prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed",
                  msg.role === 'user' ? "text-slate-100" : "text-slate-800 dark:text-slate-200"
                )}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
                {msg.role === 'model' && (
                  <div className="mt-4 pt-4 border-t border-green-100/30 dark:border-slate-700/50 flex justify-end">
                    <button 
                      onClick={() => handleTTS(msg.content)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white transition-all bg-green-50 dark:bg-green-950/20"
                    >
                      <Volume2 size={14} /> Speak
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                <Bot size={20} />
              </div>
              <div className="flex gap-1.5 p-4 bg-green-50 rounded-full">
                <span className="w-1 h-1 rounded-full bg-green-500 animate-bounce" />
                <span className="w-1 h-1 rounded-full bg-green-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1 h-1 rounded-full bg-green-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-green-100 dark:border-slate-800">
          <div className="max-w-3xl mx-auto flex gap-3 relative">
            <button 
              onClick={handleVoiceInput}
              className="p-4 bg-white dark:bg-slate-800 text-green-600 dark:text-green-500 rounded-2xl border border-green-100 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-slate-700 transition-all shadow-sm"
              title="Voice Input"
            >
              <Mic size={20} />
            </button>
            <div className="flex-1 relative">
               <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your agricultural query..."
                className="w-full bg-white dark:bg-slate-800 border border-green-100 dark:border-slate-700 text-black dark:text-white rounded-2xl px-6 py-4 pr-32 outline-none shadow-sm focus:ring-2 focus:ring-green-500/10 transition-all font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                 {loading && (
                   <button 
                     onClick={handleStop}
                     className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
                     title="Stop generating"
                   >
                     <Square size={18} fill="currentColor" />
                   </button>
                 )}
                 <button 
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg shadow-green-200"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles size={10} /> Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
}
