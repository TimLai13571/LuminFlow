import { motion } from 'framer-motion'
import { useTranslation } from '@/hooks/useTranslation'
import type { ChatMessage as ChatMessageType } from '@/hooks/useAIChat'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const { t, language } = useTranslation()
  const isUser = message.role === 'user'
  const timeStr = message.timestamp.toLocaleTimeString(language === 'en' ? 'en-US' : 'zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        {!isUser && (
          <span className="text-xs text-gray-500 mb-1 block">🤖 {t('ai.title')}</span>
        )}
        <div
          className={
            isUser
              ? 'rounded-tl-xl rounded-tr-xl rounded-bl-xl px-4 py-2.5 text-sm text-white whitespace-pre-wrap'
              : 'rounded-tr-xl rounded-br-xl rounded-bl-xl border-l-[3px] px-4 py-2.5 text-sm whitespace-pre-wrap bg-white'
          }
          style={
            isUser
              ? { backgroundColor: '#1E49E2' }
              : { borderLeftColor: '#C5A04E', color: '#1A1A2E' }
          }
        >
          {message.content}
          {isStreaming && !isUser && (
            <span className="inline-block w-[2px] h-4 bg-accent-gold ml-0.5 animate-pulse align-middle" />
          )}
        </div>
        <span className={`text-[11px] text-gray-400 mt-1 block ${isUser ? 'text-right' : 'text-left'}`}>
          {timeStr}
        </span>
      </div>
    </motion.div>
  )
}
