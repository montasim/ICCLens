import { InformationCircleIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'

export function FailureNotice({ reason }: { reason: string }) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <aside className="fixed bottom-4 right-4 z-[2147483647] max-w-sm rounded-2xl border border-divider bg-surface p-4 text-content shadow-2xl">
      <div className="flex items-start gap-3">
        <HugeIcon
          icon={InformationCircleIcon}
          className="mt-0.5 size-5 shrink-0 text-action-on-surface"
        />
        <div className="min-w-0 flex-1">
          <strong className="block text-sm font-bold">
            ICC Lens kept the original page
          </strong>
          <p className="mt-1 text-xs font-medium leading-5 text-content-muted [overflow-wrap:anywhere]">
            {reason}
          </p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="mt-3 min-h-11 rounded-lg bg-action px-3 py-2 text-xs font-bold text-action-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/45"
          >
            Dismiss
          </button>
        </div>
      </div>
    </aside>
  )
}
