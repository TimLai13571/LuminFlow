import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTranslation } from '@/hooks/useTranslation'
import { GlossaryTerm } from '@/components/ui/glossary-term'
import { motion, AnimatePresence } from 'framer-motion'

interface AILogicExplainerProps {
  rationale?: string[]
}

const defaultLogic = [
  { num: 1, textKey: 'sampling.logicStep1', highlight: '' },
  { num: 2, textKey: 'sampling.logicStep2', highlight: '×1.2' },
  { num: 3, textKey: 'sampling.logicStep3', highlight: '+15%' },
  { num: 4, textKey: 'sampling.logicStep4', highlight: '1.5' },
]

const factorIcons = ['📊', '📈', '🔒', '📋', '💻']
const factorKeys = [
  'populationSize',
  'riskScore',
  'confidenceLevel',
  'priorDeficiency',
  'systemChanges',
] as const

export function AILogicExplainer({ rationale: _rationale }: AILogicExplainerProps) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('factors')

  return (
    <Card className="h-full border-0 shadow-none">
      <CardContent className="p-0 h-full">
        <div
          className="h-full rounded-lg p-5 border-l-4"
          style={{
            backgroundColor: '#FFFDF7',
            borderLeftColor: '#C5A04E',
          }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🤖</span>
            <h3 className="text-base font-semibold text-gray-900">
              <GlossaryTerm term="toc">{t('sampling.aiLogic')}</GlossaryTerm>
            </h3>
          </div>

          {/* 4 Core Logic Steps */}
          <div className="space-y-3">
            {defaultLogic.map((item) => {
              const text = t(item.textKey)
              return (
                <div key={item.num} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: '#00338D' }}
                  >
                    {item.num}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.highlight && text.includes(item.highlight)
                      ? text.split(item.highlight).map((part: string, idx: number, arr: string[]) => (
                          <span key={idx}>
                            {part}
                            {idx < arr.length - 1 && (
                              <span className="font-semibold" style={{ color: '#00338D' }}>
                                {item.highlight}
                              </span>
                            )}
                          </span>
                        ))
                      : text}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Methodology Expandable Section */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-4 border-t border-amber-200/60">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    {t('sampling.methodology.title')}
                  </h4>

                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full">
                      <TabsTrigger value="factors" className="flex-1 text-xs">
                        {t('sampling.methodology.tabFactors')}
                      </TabsTrigger>
                      <TabsTrigger value="formula" className="flex-1 text-xs">
                        {t('sampling.methodology.tabFormula')}
                      </TabsTrigger>
                      <TabsTrigger value="aiLogic" className="flex-1 text-xs">
                        {t('sampling.methodology.tabAILogic')}
                      </TabsTrigger>
                    </TabsList>

                    {/* Tab A: Basis Factors */}
                    <TabsContent value="factors">
                      <div className="space-y-3 mt-3">
                        {factorKeys.map((key, idx) => (
                          <div
                            key={key}
                            className="rounded-md bg-white/70 border border-amber-100 p-3"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-base">{factorIcons[idx]}</span>
                              <span className="text-sm font-medium text-gray-900">
                                {key === 'priorDeficiency' ? (
                                  <GlossaryTerm term="deviation">
                                    {t(`sampling.methodology.factor.${key}` as never)}
                                  </GlossaryTerm>
                                ) : (
                                  t(`sampling.methodology.factor.${key}` as never)
                                )}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 leading-relaxed ml-7 mb-1.5">
                              {t(`sampling.methodology.factor.${key}Desc` as never)}
                            </p>
                            <p className="text-xs ml-7 font-medium" style={{ color: '#D32F2F' }}>
                              ↑ {t(`sampling.methodology.factor.${key}Impact` as never)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Tab B: Calculation Formula */}
                    <TabsContent value="formula">
                      <div className="mt-3 space-y-4">
                        {/* Formula Display */}
                        <div>
                          <h5 className="text-xs font-semibold text-gray-800 mb-2">
                            {t('sampling.methodology.formula.title')}
                          </h5>
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                            <code className="text-xs font-mono text-gray-800 leading-relaxed">
                              {t('sampling.methodology.formula.formula')}
                            </code>
                          </div>
                        </div>

                        {/* Parameter Definitions */}
                        <div>
                          <h5 className="text-xs font-semibold text-gray-800 mb-2">
                            {t('sampling.methodology.formula.paramTitle')}
                          </h5>
                          <ul className="space-y-1.5">
                            {(['base', 'riskFactor', 'confidenceMultiplier', 'deficiencyUplift'] as const).map(
                              (param) => (
                                <li key={param} className="text-xs text-gray-700 flex items-start gap-2">
                                  <span className="text-amber-500 mt-0.5">•</span>
                                  <span className="font-mono bg-gray-50 px-1 rounded">
                                    {t(`sampling.methodology.formula.${param}` as never)}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>

                        {/* Example Calculation */}
                        <div>
                          <h5 className="text-xs font-semibold text-gray-800 mb-2">
                            {t('sampling.methodology.formula.exampleTitle')}
                          </h5>
                          <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-1">
                            <p className="text-xs text-gray-600">
                              {t('sampling.methodology.formula.exampleScenario')}
                            </p>
                            <p className="text-xs font-mono text-gray-800 font-medium">
                              {t('sampling.methodology.formula.exampleCalc')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Tab C: AI Recommendation Logic */}
                    <TabsContent value="aiLogic">
                      <div className="mt-3 space-y-3">
                        <div>
                          <h5 className="text-xs font-semibold text-gray-800 mb-1">
                            {t('sampling.methodology.ai.title')}
                          </h5>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {t('sampling.methodology.ai.overview')}
                          </p>
                        </div>

                        {([1, 2, 3, 4] as const).map((step) => (
                          <div
                            key={step}
                            className="rounded-md bg-white/70 border border-amber-100 p-3"
                          >
                            <h6 className="text-xs font-semibold text-gray-800 mb-1">
                              {t(`sampling.methodology.ai.step${step}Title` as never)}
                            </h6>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {t(`sampling.methodology.ai.step${step}Desc` as never)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Buttons */}
          <div className="flex gap-3 mt-5 pt-4 border-t border-amber-200/60">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-brand-primary hover:text-brand-interactive"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? t('sampling.methodology.collapseDetails') : t('sampling.expandDetails')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-brand-primary hover:text-brand-interactive"
              onClick={() => console.log('ask auditor')}
            >
              {t('sampling.askAuditor')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
