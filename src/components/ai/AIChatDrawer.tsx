import { useState, useCallback, type KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Trash2 } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useAuthStore } from '@/store/auth-store'
import { useAIChat } from '@/hooks/useAIChat'
import { ChatMessage } from './ChatMessage'
import { QuickPrompts } from './QuickPrompts'
import { useTranslation } from '@/hooks/useTranslation'

export function AIChatDrawer() {
  const { aiDrawerOpen, setAIDrawerOpen } = useUIStore()
  const { currentRole } = useAuthStore()
  const { messages, isStreaming, sendMessage, clearHistory, scrollRef } = useAIChat()
  const [input, setInput] = useState('')
  const { t } = useTranslation()

  const currentPage = window.location.pathname

  const handleSend = useCallback(() => {
    if (!input.trim() || isStreaming) return
    sendMessage(input)
    setInput('')
  }, [input, isStreaming, sendMessage])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickSelect = useCallback(
    (prompt: string) => {
      sendMessage(prompt)
    },
    [sendMessage]
  )

  return (
    <AnimatePresence>
      {aiDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setAIDrawerOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-[400px] max-sm:w-full flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-brand-primary">{t('ai.title')}</h2>
                <span className="rounded-full bg-brand-light px-2 py-0.5 text-[11px] text-brand-primary">
                  {t(`role.${currentRole}`)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearHistory}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  title={t('ai.clear')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setAIDrawerOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                  <div className="mb-3 text-4xl">🤖</div>
                  <p className="text-sm">{t('ai.welcome')}</p>
                  <p className="text-xs mt-1">{t('ai.welcomeHint')}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg}
                    isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'assistant'}
                  />
                ))
              )}
            </div>

            {/* Quick Prompts */}
            <div className="border-t px-3">
              <QuickPrompts onSelect={handleQuickSelect} currentPage={currentPage} />
            </div>

            {/* Input Area */}
            <div className="border-t p-3">
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isStreaming}
                  placeholder={t('ai.placeholder')}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-interactive disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors disabled:opacity-40"
                  style={{ backgroundColor: '#1E49E2' }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
