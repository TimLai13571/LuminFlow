import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { useTranslation } from '@/hooks/useTranslation'

export function AIFloatingButton() {
  const { toggleAIDrawer } = useUIStore()
  const { t } = useTranslation()

  return (
    <motion.button
      onClick={toggleAIDrawer}
      className="fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
      style={{ backgroundColor: '#00338D' }}
      animate={{
        opacity: [0.9, 1, 0.9],
      }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{
        scale: 1.1,
        boxShadow: '0 8px 30px rgba(0, 51, 141, 0.4)',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={t('ai.openLabel')}
    >
      <MessageCircle className="h-6 w-6 text-white" />
    </motion.button>
  )
}
