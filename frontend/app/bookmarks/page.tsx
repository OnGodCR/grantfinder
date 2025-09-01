'use client'

import SidebarShell from '@/components/SidebarShell'

const collections = [
  {
    name: 'Upcoming Deadlines',
    grants: [
      { id: '1', title: 'NSF Climate Innovation Program', deadline: '2025-09-30' },
      { id: '2', title: 'NIH AI in Healthcare Grant', deadline: '2025-10-15' },
    ],
  },
  {
    name: 'Climate Grants',
    grants: [
      { id: '3', title: 'Horizon Europe GreenTech Fund', deadline: '2025-11-05' },
    ],
  },
  { name: 'Training Opportunities', grants: [] },
]

export default function BookmarksPage() {
  return (
    <SidebarShell>
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Saved Grants</h1>

      <div className="grid gap-6">
        {collections.map((col) => (
          <div key={col.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">{col.name}</h2>
            <div className="mt-3 grid gap-3">
              {col.grants.length === 0 && (
                <div className="opacity-70 text-sm">No items yet.</div>
              )}
              {col.grants.map((g) => (
                <div key={g.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{g.title}</div>
                      <div className="text-sm opacity-70">
                        Deadline: {new Date(g.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a className="btn" href={`/grants/${g.id}`}>View</a>
                      <button className="btn" onClick={() => alert('Remove bookmark (wire backend later)')}>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SidebarShell>
  )
}
