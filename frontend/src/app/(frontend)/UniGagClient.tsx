'use client'

import dynamic from 'next/dynamic'
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
  return (
    <UniGagApp 
      squadProfiles={squadProfiles} 
      currentStudent={currentStudent} 
      dbCourses={initialCourses}
      dbNextEvent={nextEvent}
    />
  )
}