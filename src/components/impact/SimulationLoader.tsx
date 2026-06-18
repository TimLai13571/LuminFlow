import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface SimulationLoaderProps {
  onComplete: () => void
}

const stageKeys = [
  'impact.stage1',
  'impact.stage2',
  'impact.stage3',
  'impact.stage4',
]

export default function SimulationLoader({ onComplete }: SimulationLoaderProps) {
  const { t } = useTranslation()
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIndex((prev) => {
        if (prev >= stageKeys.length - 1) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 750)

    const timeout = setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [onComplete])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6">
      {/* Pulsing circle */}
      <motion.div
        className="relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="absolute w-24 h-24 rounded-full"
          style={{ backgroundColor: 'rgba(197, 160, 78, 0.15)' }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-16 h-16 rounded-full"
          style={{ backgroundColor: 'rgba(197, 160, 78, 0.3)' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />
        <motion.div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#C5A04E' }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.p
        className="text-lg font-semibold text-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {t('impact.analyzing')}
      </motion.p>

      {/* Stage progress */}
      <div className="flex flex-col gap-2 w-64">
        <AnimatePresence mode="wait">
          {stageKeys.map((stageKey, i) => (
            <motion.div
              key={stageKey}
              className="flex items-center gap-2 text-sm"
              initial={{ opacity: 0, x: -10 }}
              animate={{
                opacity: i <= stageIndex ? 1 : 0.3,
                x: 0,
              }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: i <= stageIndex ? '#C5A04E' : '#D1D5DB',
                }}
              />
              <span
                className={i <= stageIndex ? 'text-gray-700' : 'text-gray-400'}
              >
                {t(stageKey)}
              </span>
              {i < stageIndex && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-600 ml-auto"
                >
                  ✓
                </motion.span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
