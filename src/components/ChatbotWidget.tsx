import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, Trash2, Loader2, UtensilsCrossed, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useChatbot } from '../hooks/useChatbot';
import { ChatMessage } from './ChatMessage';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Trophy, Calendar } from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useUserProfile } from '../hooks/useUserProfile';
import { useScheduledWorkouts } from '../hooks/useScheduledWorkouts';
import { toast } from 'sonner';

export function ChatbotWidget() {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch all user data for chatbot context
  const { workouts } = useWorkouts(100); // Get last 100 workouts
  const { records: prs } = usePersonalRecords();
  const { profile } = useUserProfile();
  const { entries: nutritionEntries } = useNutrition();
  const { scheduledWorkouts } = useScheduledWorkouts();

  // Initialize chatbot with full user context
  const { messages, isLoading, sendMessage, clearMessages } = useChatbot({
    workouts,
    profile,
    prs,
    nutritionEntries,
    scheduledWorkouts,
  });
  
  const { addEntry } = useNutrition();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle action execution from bot messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && lastMessage.action) {
      handleBotAction(lastMessage.action);
    }
  }, [messages]);

  const handleBotAction = async (action: { name: string; result: any }) => {
    try {
      if (action.name === 'addMeal') {
        // Le backend a déjà enregistré le repas dans Firestore
        // On affiche juste une notification de confirmation
        const mealData = action.result.data || action.result;
        
        if (mealData.mealName && mealData.calories) {
          toast.success(`Repas ajouté avec succès ! 🍽️`, {
            description: `${mealData.mealName} - ${mealData.calories} kcal`,
          });
        }
      }
    } catch (error) {
      console.error('Error executing bot action:', error);
      toast.error('Erreur lors de l\'ajout du repas', {
        description: 'Réessaye dans quelques instants.',
      });
    }
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick action suggestions
  const quickActions = [
    { icon: BarChart3, label: 'Mes stats', message: 'Montre-moi mes statistiques de la semaine', gradient: 'from-[#22C55E] to-[#00D1FF]' },
    { icon: Trophy, label: 'Ajouter PR', message: 'Je veux ajouter un nouveau PR', gradient: 'from-[#00D1FF] to-[#22C55E]' },
    { icon: Calendar, label: 'Planning', message: 'Planifie-moi un workout Push demain', gradient: 'from-[#22C55E] to-[#00D1FF]' },
    { icon: UtensilsCrossed, label: 'Repas', message: 'Je veux ajouter un repas', gradient: 'from-[#00D1FF] to-[#22C55E]' },
  ];

  if (!currentUser) return null;

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: 'spring', bounce: 0.5 }}
            className="fixed bottom-6 right-6 z-50"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-full blur-xl opacity-40 animate-pulse" />
            
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#22C55E] to-[#00D1FF] shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 group"
            >
              <Bot className="w-8 h-8 text-white" />
              
              {/* Status indicator */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-[#0B0B0F] flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-[#22C55E]" />
              </div>
              
              {/* Ripple effect */}
              <div className="absolute inset-0 rounded-full bg-[#22C55E] animate-ping opacity-20" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, type: 'spring' }}
            className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Gradient border wrapper */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] via-[#00D1FF] to-[#22C55E] rounded-3xl p-[2px]">
              <div className="w-full h-full bg-[#0B0B0F] rounded-3xl flex flex-col">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[#22C55E] to-[#00D1FF] p-5 rounded-t-3xl">
                  {/* Subtle pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                      backgroundSize: '32px 32px'
                    }}></div>
                  </div>
                  
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30 shadow-lg">
                        <Bot className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white text-lg">FitBot AI</h3>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" />
                          <p className="text-white/90 text-sm">En ligne</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {messages.length > 0 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearMessages}
                          className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-xl transition-all"
                          title="Effacer l'historique"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsOpen(false)}
                        className="h-9 w-9 p-0 text-white hover:bg-white/20 rounded-xl transition-all"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Powered by badge */}
                  <div className="relative mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                    <Zap className="w-3 h-3 text-white" />
                    <span className="text-xs text-white/90">Powered by GPT-4</span>
                  </div>
                </div>

                {/* Messages area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0B0B0F]">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="relative mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] rounded-3xl blur-2xl opacity-30" />
                      </div>
                      
                      <h4 className="text-white text-xl mb-2 text-[24px] m-[0px]">
                        Hey {currentUser.displayName?.split(' ')[0] || 'champion'} ! 👋
                      </h4>
                      <p className="text-gray-400 text-sm mb-12 max-w-xs leading-relaxed">
                        Je suis ton assistant IA personnel. Prêt à booster tes performances ? 🚀
                      </p>
                      
                      {/* Quick actions */}
                      <div className="grid grid-cols-2 gap-3 w-full">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInputValue(action.message);
                              setTimeout(() => handleSend(), 100);
                            }}
                            className="group relative p-4 bg-[#151923] hover:bg-[#1a1f2e] border border-white/10 hover:border-[#22C55E]/30 rounded-2xl transition-all duration-300"
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                              <action.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs text-gray-300 group-hover:text-white transition-colors">
                              {action.label}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-[#151923] border border-[#22C55E]/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#22C55E] animate-spin" />
                        <span className="text-sm text-gray-400">FitBot réfléchit...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div className="p-5 border-t border-white/10 bg-[#0B0B0F] rounded-b-3xl">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Écris ton message..."
                        className="w-full bg-[#151923] border-white/10 focus:border-[#22C55E] text-white placeholder:text-gray-500 h-12 rounded-xl pr-4 pl-4 transition-all"
                        disabled={isLoading}
                      />
                    </div>
                    <Button
                      onClick={handleSend}
                      disabled={!inputValue.trim() || isLoading}
                      className="h-12 w-12 p-0 bg-gradient-to-br from-[#22C55E] to-[#00D1FF] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-[#22C55E]/20 transition-all"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Footer info */}
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                    <p className="text-xs text-gray-500">
                      Réponses instantanées • 100% gratuit
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}