import { Sidebar } from '@/components/Sidebar'
import { WorkspaceProvider } from '@/lib/WorkspaceContext'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="flex h-screen bg-bg">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </WorkspaceProvider>
  )
}
