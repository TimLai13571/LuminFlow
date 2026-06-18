import { useState, useRef, useCallback } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { useLanguageStore } from '@/store/language-store'
import { translateData } from '@/locales/data-translations'
import { classifyQuery, simulateMockStream } from '@/services/chat-mock'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export function useAIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const { currentRole } = useAuthStore()

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    }, 50)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return

      const userMsg: ChatMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setIsStreaming(true)
      scrollToBottom()

      const currentPage = window.location.pathname
      const contextPayload = {
        page: currentPage,
        role: currentRole,
        language: useLanguageStore.getState().language,
        selected_node: null,
      }

      const requestBody = {
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        context: contextPayload,
        role: currentRole,
      }

      try {
        abortRef.current = new AbortController()
        const response = await fetch(`${API_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
          signal: abortRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error(translateData('无法获取响应流', useLanguageStore.getState().language))

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data:')) continue

            const jsonStr = trimmed.slice(5).trim()
            if (!jsonStr) continue

            try {
              const parsed = JSON.parse(jsonStr)
              if (parsed.done) {
                setIsStreaming(false)
                return
              }
              if (parsed.content) {
                setMessages((prev) => {
                  const updated = [...prev]
                  const lastMsg = updated[updated.length - 1]
                  if (lastMsg && lastMsg.role === 'assistant') {
                    updated[updated.length - 1] = {
                      ...lastMsg,
                      content: lastMsg.content + parsed.content,
                    }
                  }
                  return updated
                })
                scrollToBottom()
              }
            } catch {
              // Skip malformed JSON lines
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return

        // ── 后端不可用时降级为客户端 Mock ──
        const isNetworkError =
          err instanceof TypeError ||
          (err instanceof Error &&
            (err.message.includes('Failed to fetch') ||
             err.message.includes('NetworkError') ||
             err.message.includes('fetch')))

        if (isNetworkError) {
          // 使用客户端 mock 模拟 SSE 流式回复
          const language = useLanguageStore.getState().language
          const category = classifyQuery(
            [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          )
          try {
            await simulateMockStream(
              category,
              language,
              ({ content, done }) => {
                if (done) {
                  setIsStreaming(false)
                  return
                }
                if (content) {
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg && lastMsg.role === 'assistant') {
                      updated[updated.length - 1] = {
                        ...lastMsg,
                        content: lastMsg.content + content,
                      }
                    }
                    return updated
                  })
                  scrollToBottom()
                }
              },
              abortRef.current?.signal,
            )
            return // mock 流正常结束
          } catch {
            // mock 流中断也降级为文本消息
          }
        }

        const errorMessage =
          err instanceof Error ? err.message : translateData('网络连接失败，请稍后重试', useLanguageStore.getState().language)
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg && lastMsg.role === 'assistant') {
            updated[updated.length - 1] = {
              ...lastMsg,
              content: `⚠️ ${errorMessage}`,
            }
          }
          return updated
        })
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, isStreaming, currentRole, scrollToBottom]
  )

  const clearHistory = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    isStreaming,
    sendMessage,
    clearHistory,
    scrollRef,
  }
}
