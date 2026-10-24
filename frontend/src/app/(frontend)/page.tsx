import { supabase } from '@/lib/supabaseClient'
import UniGagClient from './UniGagClient'
import type { SquadProfile, CurrentStudent } from './UniGagApp'

// Força o Next.js a nunca fazer cache desta página e revalidar a cada requisição
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function HomePage() {
  // 1. Busca o estudante atual
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .limit(1)

  const currentStudentData = students?.[0] || {
    id: 1,
    name: 'Paulo Cesar',
    course: 'Engenharia de Software',
    semester: 4,
  }

  const currentStudent: CurrentStudent = {
    id: currentStudentData.id,
    name: currentStudentData.name,
    course: currentStudentData.course,
    semester: currentStudentData.semester,
  }

  // 2. Busca todas as disciplinas do banco
  const { data: dbSubjects } = await supabase
    .from('subjects')
    .select('*')

  // 3. Busca o histórico de presenças e faltas do banco
  const { data: dbAttendances } = await supabase
    .from('attendances')
    .select('*')

  // 4. Busca os eventos acadêmicos (entregas e provas)
  const { data: dbEvents } = await supabase
    .from('academic_events')
    .select('*')
    .order('event_date', { ascending: true })

  // 5. Mapeia disciplinas calculando dinamicamente faltas e presenças reais
  const initialCourses = dbSubjects && dbSubjects.length > 0 
    ? dbSubjects.map((sub: any, index: number) => {
        // Filtra todas as entradas de frequência desta matéria (compara como string para evitar mismatch de tipo)
        const subjectAttendances = dbAttendances?.filter(
          (att: any) => String(att.subject_id) === String(sub.id)
        ) || []

        const subjectAbsences = subjectAttendances.filter(
          (att: any) => att.status === 'absence'
        ).length

        const subjectPresents = subjectAttendances.filter(
          (att: any) => att.status === 'present'
        ).length

        const colors = ['lavender', 'blue', 'mint', 'coral']
        const avatars = ['diva', 'bearded', 'capybara', 'anime']

        return {
          id: sub.id,
          code: sub.code || `MAT${index + 1}`,
          name: sub.name,
          professor: 'Prof. Responsável',
          color: colors[index % colors.length],
          avatar: avatars[index % avatars.length],
          classes: sub.total_classes || 64,
          presents: subjectPresents,
          absences: subjectAbsences,
          limit: sub.max_absences || 16,
          grade: 8.0,
          schedule: 'SEG · QUA 08:00',
        }
      })
    : undefined

  // 6. Próximo evento a ocorrer
  const nextEvent = dbEvents && dbEvents.length > 0 ? dbEvents[0] : null

  // 7. Perfil inicial do Gag Squad
  const squadProfiles: SquadProfile[] = [
    {
      id: String(currentStudent.id),
      displayName: currentStudent.name || 'Paulo Cesar',
      username: '@' + (currentStudent.name?.toLowerCase().replace(/\s+/g, '') || 'paulocesar'),
      course: currentStudent.course || 'Engenharia de Software',
      university: 'UFG',
      semester: `${currentStudent.semester}º semestre`,
      status: 'Focado nos Estudos 📚',
      avatarEmoji: '⚡',
      attendance: 95,
      averageGrade: 8.5,
    },
  ]

  return (
    <UniGagClient 
      currentStudent={currentStudent}
      initialCourses={initialCourses}
      nextEvent={nextEvent}
      squadProfiles={squadProfiles}
    />
  )
}