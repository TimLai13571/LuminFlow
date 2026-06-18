import { Check, X, Clock, ChevronRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTranslation } from '@/hooks/useTranslation'
import { useAuthStore } from '@/store/auth-store'
import type { NarrativeApprovalStatus, ApprovalStepStatus } from '@/types/narrative'

interface NarrativeApprovalFlowProps {
  approval: NarrativeApprovalStatus
  onSubmitForApproval: () => void
  onApproveManager: () => void
  onApprovePartner: () => void
  onReject: (step: keyof NarrativeApprovalStatus) => void
}

const STEPS: { key: keyof NarrativeApprovalStatus; labelKey: string; roles: string[] }[] = [
  { key: 'aiScreening', labelKey: 'narrative.aiScreening', roles: ['AI'] },
  { key: 'managerApproval', labelKey: 'narrative.managerApproval', roles: ['auditor'] },
  { key: 'partnerQC', labelKey: 'narrative.partnerQC', roles: ['partner'] },
]

function StepIcon({ status }: { status: ApprovalStepStatus }) {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-white" />
    case 'approved':
      return <Check className="h-4 w-4 text-white" />
    case 'rejected':
      return <X className="h-4 w-4 text-white" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

export default function NarrativeApprovalFlow({
  approval,
  onSubmitForApproval,
  onApproveManager,
  onApprovePartner,
  onReject,
}: NarrativeApprovalFlowProps) {
  const { t } = useTranslation()
  const currentRole = useAuthStore((s) => s.currentRole)

  const allApproved = Object.values(approval).every((s) => s === 'approved')
  const canSubmitAI = approval.aiScreening === 'completed' && currentRole === 'auditor'
  const canApproveManager = approval.managerApproval === 'pending' && currentRole === 'auditor'
  const canApprovePartner = approval.partnerQC === 'pending' && currentRole === 'partner'

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t('narrative.approvalFlow')}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Approval Steps */}
        <div className="flex items-center justify-between mb-6">
          {STEPS.map((step, idx) => {
            const status = approval[step.key]
            const isApproved = status === 'approved'
            const isRejected = status === 'rejected'
            const isCurrent = status === 'pending' &&
              (idx === 0 ? approval.aiScreening === 'completed' : idx === 1 ? approval.managerApproval === 'pending' : approval.partnerQC === 'pending')

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isApproved
                        ? 'bg-green-500 border-green-500'
                        : isRejected
                        ? 'bg-red-500 border-red-500'
                        : status === 'completed'
                        ? 'bg-brand-primary border-brand-primary'
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <StepIcon status={status} />
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-semibold ${
                      isApproved ? 'text-green-600' :
                      isRejected ? 'text-red-500' :
                      status === 'completed' ? 'text-brand-primary' : 'text-gray-400'
                    }`}>
                      {t(step.labelKey)}
                    </p>
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="flex-1 mx-2 mt-[-16px]">
                    <div
                      className={`h-0.5 rounded-full ${
                        idx === 0 && approval.aiScreening === 'approved' ? 'bg-green-500' :
                        idx === 1 && approval.managerApproval === 'approved' ? 'bg-green-500' :
                        'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canSubmitAI && (
            <button
              onClick={onSubmitForApproval}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-btn bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-interactive transition-colors"
            >
              <Check className="h-4 w-4" />
              {t('narrative.submitForApproval')}
            </button>
          )}
          {canApproveManager && (
            <>
              <button
                onClick={onApproveManager}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-btn bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                {t('team.approve')}
              </button>
              <button
                onClick={() => onReject('managerApproval')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-btn border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
                {t('team.reject')}
              </button>
            </>
          )}
          {canApprovePartner && (
            <>
              <button
                onClick={onApprovePartner}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-btn bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <Check className="h-4 w-4" />
                {t('team.approve')}
              </button>
              <button
                onClick={() => onReject('partnerQC')}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-btn border border-red-200 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <X className="h-4 w-4" />
                {t('team.reject')}
              </button>
            </>
          )}
          {allApproved && (
            <button className="w-full flex items-center justify-center gap-2 rounded-btn bg-status-success px-4 py-2 text-sm font-medium text-white cursor-default">
              <Check className="h-4 w-4" />
              {t('narrative.done')}
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
