import { Sidebar } from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
