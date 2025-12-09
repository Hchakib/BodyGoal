import { motion } from 'motion/react';
import { Bot, User, Check } from 'lucide-react';
import { ChatMessage as ChatMessageType } from '../hooks/useChatbot';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-[#00D1FF] to-[#22C55E]'
            : 'bg-gradient-to-br from-[#22C55E] to-[#00D1FF]'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className="flex flex-col max-w-[75%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-[#22C55E] to-[#00D1FF] text-white shadow-lg shadow-[#22C55E]/20'
              : 'bg-[#151923] text-gray-200 border border-white/10'
          } ${isUser ? 'rounded-tr-md' : 'rounded-tl-md'}`}
        >
          {/* Message content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Action result badge (if any) */}
          {message.action && message.action.result?.success && (
            <div className={`mt-3 pt-3 flex items-center gap-2 ${
              isUser ? 'border-t border-white/20' : 'border-t border-white/10'
            }`}>
              <div className="w-5 h-5 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                <Check className="w-3 h-3 text-[#22C55E]" />
              </div>
              <span className={`text-xs ${
                isUser ? 'text-white/80' : 'text-gray-400'
              }`}>
                Action exécutée : {message.action.name}
              </span>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div
          className={`text-xs mt-1.5 px-2 ${
            isUser ? 'text-right text-gray-500' : 'text-left text-gray-600'
          }`}
        >
          {message.timestamp.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </motion.div>
  );
}
