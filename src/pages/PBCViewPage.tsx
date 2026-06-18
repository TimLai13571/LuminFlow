import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { ANIMATION_VARIANTS } from '@/lib/constants'
import { useTranslation } from '@/hooks/useTranslation'
import { usePBCView } from '@/hooks/usePBCView'
import PBCStatsBar from '@/components/pbcview/PBCStatsBar'
import PBCAutoGenerator from '@/components/pbcview/PBCAutoGenerator'
import PBCListTable from '@/components/pbcview/PBCListTable'
import PBCOverdueAlert from '@/components/pbcview/PBCOverdueAlert'
import PBCProgressTracker from '@/components/pbcview/PBCProgressTracker'
import PBCEmailDraft from '@/components/pbcview/PBCEmailDraft'

export default function PBCViewPage() {
  const { t } = useTranslation()
  const {
    filteredList,
    stats,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    progressByControl,
    emailDraft,
    showEmailDraft,
    setShowEmailDraft,
    selectedIndustry,
    setSelectedIndustry,
    selectedProcesses,
    setSelectedProcesses,
    generatedItems,
    approvalStatus,
    generatePBCList,
    generateInterviewOutline,
    generateReminderEmail,
    editGeneratedItem,
    removeGeneratedItem,
    submitForApproval,
  } = usePBCView()

  return (
    <motion.div {...ANIMATION_VARIANTS.fadeIn} className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <ClipboardList className="h-7 w-7 text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pbcview.title')}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t('pbcview.subtitle')}</p>
        </div>
      </div>

      {/* Top: KPI Stats */}
      <PBCStatsBar
        total={stats.total}
        submitted={stats.submitted}
        pending={stats.pending}
        overdue={stats.overdue}
        overdueLongest={stats.overdueLongest}
      />

      {/* Overdue Alert Banner */}
      <PBCOverdueAlert
        overdueCount={stats.overdue}
        overdueLongest={stats.overdueLongest}
        onGenerateEmail={generateReminderEmail}
        onViewList={() => setStatusFilter('overdue')}
      />

      {/* Main Layout: Left AutoGenerator + Right Table */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left: PBC Auto Generator */}
        <div>
          <PBCAutoGenerator
            onGeneratePBC={generatePBCList}
            onGenerateInterview={generateInterviewOutline}
            selectedIndustry={selectedIndustry}
            onIndustryChange={setSelectedIndustry}
            selectedProcesses={selectedProcesses}
            onProcessesChange={setSelectedProcesses}
            generatedItems={generatedItems}
            onEditGeneratedItem={editGeneratedItem}
            onRemoveGeneratedItem={removeGeneratedItem}
            onSubmitForApproval={submitForApproval}
            approvalStatus={approvalStatus}
          />
        </div>

        {/* Right: PBC List Table */}
        <div>
          <PBCListTable
            pbcList={filteredList}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      </div>

      {/* Bottom: Progress Tracker */}
      <PBCProgressTracker progressItems={progressByControl} />

      {/* Email Draft (collapsible) */}
      <PBCEmailDraft
        to={emailDraft.to}
        subject={emailDraft.subject}
        body={emailDraft.body}
        visible={showEmailDraft}
        onClose={() => setShowEmailDraft(false)}
      />
    </motion.div>
  )
}
