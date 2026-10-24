import path from 'path'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { pt as adminLanguage } from '@payloadcms/translations/languages/pt'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Folders } from './collections/Folders'
import { Tags } from './collections/Tags'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { StudentProfiles } from './collections/StudentProfiles'
import { Friendships } from './collections/Friendships'
import { AcademicEvents } from './collections/AcademicEvents'
import { CourseProgress } from './collections/CourseProgress'
import { SquadMessages } from './collections/SquadMessages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.SUPABASE_DB_URL || '',
    },
    push: false,
  }),
  secret: process.env.PAYLOAD_SECRET || 'unigag-secret-local-dev-key-123456789',
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt: adminLanguage },
  },
  collections: [
    Admins,
    Users,
    StudentProfiles,
    Friendships,
    AcademicEvents,
    CourseProgress,
    SquadMessages,
    Media,
    Folders,
    Tags,
    Posts,
  ],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  plugins: [mcpPlugin({})],
})