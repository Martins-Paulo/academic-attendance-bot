'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { SquadProfile, CurrentStudent } from './UniGagApp'

const UniGagApp = dynamic(() => import('./UniGagApp'), {
  ssr: false,
})

export default function UniGagClient({
  squadProfiles,
  currentStudent,
  initialCourses,
  nextEvent,
}: {
  squadProfiles: SquadProfile[]
  currentStudent?: CurrentStudent
  initialCourses?: any[]
  nextEvent?: any
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login')
    }
  }, [user, isLoading, router])

  // Enquanto valida a sessão ou se não estiver autenticado (evita flash do dashboard)
  if (isLoading || !user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fbf8fb',
          padding: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="brand__mark">
            <span />
            <span />
            <span />
          </div>
          <span className="brand__name" style={{ fontSize: '24px' }}>
            UniGag
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted, #71717a)', fontSize: '14px' }}>
          <Loader2 className="animate-spin" size={18} />
          <span>Carregando painel acadêmico...</span>
        </div>
      </div>
    )
  }

  return (
    <UniGagApp 
      squadProfiles={squadProfiles} 
      currentStudent={currentStudent} 
      dbCourses={initialCourses}
      dbNextEvent={nextEvent}
    />
  )
}