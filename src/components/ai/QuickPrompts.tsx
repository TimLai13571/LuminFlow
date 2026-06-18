import { useMemo } from 'react'
import { useLanguageStore } from '@/store/language-store'

interface QuickPromptsProps {
  onSelect: (prompt: string) => void
  currentPage: string
}

const PAGE_PROMPTS_ZH: Record<string, string[]> = {
  '/': [
    '本期审计的主要风险是什么？',
    'PBC逾期项如何处理？',
    '控制覆盖率趋势分析',
    '本期审计进度概览',
    '重点关注事项有哪些？',
  ],
  '/objective': [
    '这个控制点为什么被标红？',
    'COSO映射关系说明',
    '当前审计目标的完成度',
    '控制缺陷的严重程度分析',
    '建议优先处理哪个目标？',
  ],
  '/sampling': [
    '抽样逻辑的技术依据',
    '为什么选择这些分行？',
    '样本量是否充分？',
    '如何调整置信水平？',
    '历史抽样结果对比',
  ],
  '/impact': [
    '模拟结果的置信度',
    '推荐方案的优先级依据',
    '最大影响路径分析',
    '控制失效的连锁反应',
    '如何降低影响范围？',
  ],
  '/team': [
    '客户最关注哪些指标？',
    'AI内容审批最佳实践',
    '团队协作效率建议',
    '待审批项优先级排列',
    '如何提高沟通效率？',
  ],
}

const PAGE_PROMPTS_EN: Record<string, string[]> = {
  '/': [
    'What are the key risks this period?',
    'How to handle overdue PBC items?',
    'Control coverage rate trend analysis',
    'Current audit progress overview',
    'What are the key focus areas?',
  ],
  '/objective': [
    'Why is this control flagged red?',
    'Explain COSO mapping relationship',
    'Completion status of audit objectives',
    'Severity analysis of control deficiencies',
    'Which objective to prioritize?',
  ],
  '/sampling': [
    'Technical basis for sampling logic',
    'Why were these branches selected?',
    'Is the sample size sufficient?',
    'How to adjust confidence level?',
    'Compare historical sampling results',
  ],
  '/impact': [
    'Confidence level of simulation results',
    'Priority basis for recommendations',
    'Maximum impact path analysis',
    'Cascading effects of control failure',
    'How to reduce impact scope?',
  ],
  '/team': [
    'Which metrics does client focus on?',
    'AI content approval best practices',
    'Team collaboration efficiency tips',
    'Prioritize pending approval items',
    'How to improve communication?',
  ],
}

export function QuickPrompts({ onSelect, currentPage }: QuickPromptsProps) {
  const language = useLanguageStore((s) => s.language)

  const prompts = useMemo(() => {
    const promptMap = language === 'en' ? PAGE_PROMPTS_EN : PAGE_PROMPTS_ZH
    return promptMap[currentPage] || promptMap['/']
  }, [currentPage, language])

  return (
    <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="shrink-0 rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-brand-light hover:border-gray-300 transition-colors whitespace-nowrap"
        >
          {prompt}
        </button>
      ))}
    </div>
  )
}
