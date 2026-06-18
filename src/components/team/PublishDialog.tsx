import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/hooks/useTranslation'

interface PublishDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  changes: string[]
}

export default function PublishDialog({ open, onConfirm, onCancel, changes }: PublishDialogProps) {
  const { t } = useTranslation()
  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('team.confirmPublish')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('team.publishDesc')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2">
          <p className="text-sm font-medium text-text-primary">{t('team.changeSummary')}</p>
          <ul className="list-disc pl-5 space-y-1">
            {changes.map((change, idx) => (
              <li key={idx} className="text-sm text-gray-600">{change}</li>
            ))}
          </ul>
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={onCancel}>{t('team.cancelBtn')}</Button>
          <Button onClick={onConfirm}>{t('team.confirmBtn')}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
