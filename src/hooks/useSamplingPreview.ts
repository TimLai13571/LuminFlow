import { useState, useEffect, useCallback } from 'react'
import type { SamplingPlan } from '@/types/sampling'
import { getSamplingPlan } from '@/services/mock-data'

interface UseSamplingPreviewReturn {
  samplingPlan: SamplingPlan | null
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  isLoading: boolean
}

export function useSamplingPreview(): UseSamplingPreviewReturn {
  const [samplingPlan, setSamplingPlan] = useState<SamplingPlan | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const plan = await getSamplingPlan()
      setSamplingPlan(plan)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    samplingPlan,
    selectedCategory,
    setSelectedCategory,
    isLoading,
  }
}
