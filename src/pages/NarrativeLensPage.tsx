import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { useNarrativeLens } from '@/hooks/useNarrativeLens'
import FindingsInput from '@/components/narrative/FindingsInput'
import NarrativeDisplay from '@/components/narrative/NarrativeDisplay'
import NarrativeEditor from '@/components/narrative/NarrativeEditor'
import NarrativeApprovalFlow from '@/components/narrative/NarrativeApprovalFlow'

export default function NarrativeLensPage() {
  const { t } = useTranslation()
  const {
    topic,
    setTopic,
    findings,
    addFinding,
    updateFinding,
    removeFinding,
    referencedFindings,
    addReferencedFinding,
    removeReferencedFinding,
    narrative,
    keyPoints,
    isGenerating,
    approval,
    isDraft,
    editableNarrative,
    generate,
    saveDraft,
    updateSegment,
    submitForApproval,
    approveManager,
    approvePartner,
    rejectStep,
  } = useNarrativeLens()

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <FileText className="h-7 w-7 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('narrative.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('narrative.subtitle')}</p>
        </div>
      </div>

      {/* Main Layout: Left Config + Right Display */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Left: Configuration Panel */}
        <div className="space-y-4">
          <div className="rounded-card border border-gray-200 bg-white p-4">
            <FindingsInput
              topic={topic}
              onTopicChange={setTopic}
              findings={findings}
              onAddFinding={addFinding}
              onUpdateFinding={updateFinding}
              onRemoveFinding={removeFinding}
              onGenerate={generate}
              isGenerating={isGenerating}
              referencedFindings={referencedFindings}
              onAddReferenced={addReferencedFinding}
              onRemoveReferenced={removeReferencedFinding}
            />
          </div>
        </div>

        {/* Right: Narrative Display */}
        <div className="space-y-6">
          <NarrativeDisplay narrative={narrative} keyPoints={keyPoints} />

          {/* Editor (shown after generation) */}
          <NarrativeEditor
            editableNarrative={editableNarrative}
            isDraft={isDraft}
            onUpdateSegment={updateSegment}
            onSaveDraft={saveDraft}
          />
        </div>
      </div>

      {/* Bottom: Approval Flow */}
      {narrative.length > 0 && (
        <NarrativeApprovalFlow
          approval={approval}
          onSubmitForApproval={submitForApproval}
          onApproveManager={approveManager}
          onApprovePartner={approvePartner}
          onReject={rejectStep}
        />
      )}
    </motion.div>
  )
}
