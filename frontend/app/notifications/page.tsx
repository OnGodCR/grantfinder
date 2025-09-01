'use client'

import SidebarShell from '@/components/SidebarShell'

const items = [
  { id: 'a', text: 'NIH Emerging Tech Fund (added Sept 1)' },
  { id: 'b', text: 'NSF Early Career Award (deadline approaching Sept 10)' },
  { id: 'c', text: 'Horizon Europe BioInnovation (added Aug 29)' },
]

export default function NotificationsPage() {
  return (
    <SidebarShell>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Notifications</h1>

      <div className="grid gap-3">
        {items.map((n) => (
          <div key={n.id} className="card">{n.text}</div>
        ))}
      </div>

      <div className="mt-6">
        <button className="btn" onClick={() => alert('Show all notifications (wire later)')}>
          View All Notifications
        </button>
      </div>
    </SidebarShell>
  )
}
