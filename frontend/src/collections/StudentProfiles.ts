import type { CollectionConfig } from 'payload'
import {
  appUserOnly,
  getRequestUser,
  isAdminRequest,
  isAppUserRequest,
} from '@/access/appUsers'

export const StudentProfiles: CollectionConfig = {
  slug: 'student-profiles',
  admin: {
    group: 'UniGag',
    useAsTitle: 'displayName',
  },
  access: {
    create: appUserOnly,
    delete: ({ req }) => {
      if (isAdminRequest(req.user)) return true
      const user = getRequestUser(req.user)
      return user?.collection === 'users' ? { owner: { equals: user.id } } : false
    },
    read: ({ req }) => {
      if (isAdminRequest(req.user) || isAppUserRequest(req.user)) return true
      return { privacy: { equals: 'public' } }
    },
    update: ({ req }) => {
      if (isAdminRequest(req.user)) return true
      const user = getRequestUser(req.user)
      return user?.collection === 'users' ? { owner: { equals: user.id } } : false
    },
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const user = getRequestUser(req.user)
        if (operation === 'create' && user?.collection === 'users') {
          return { ...data, owner: user.id }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      unique: true,
      index: true,
      access: {
        create: () => false,
        update: () => false,
      },
    },
    { name: 'displayName', type: 'text', required: true },
    { name: 'username', type: 'text', required: true, unique: true, index: true },
    { name: 'university', type: 'text', required: true },
    { name: 'course', type: 'text', required: true },
    { name: 'semester', type: 'text', required: true },
    { name: 'avatarEmoji', type: 'text', defaultValue: '✨' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'Livre',
      options: ['Livre', 'Em aula agora', 'Estudando para P1'],
    },
    {
      name: 'privacy',
      type: 'select',
      defaultValue: 'selected',
      options: [
        { label: 'Privado', value: 'private' },
        { label: 'Apenas amigos selecionados', value: 'selected' },
        { label: 'Público para o Squad', value: 'public' },
      ],
    },
    {
      name: 'metrics',
      type: 'group',
      fields: [
        { name: 'attendance', type: 'number', min: 0, max: 100, defaultValue: 90 },
        { name: 'averageGrade', type: 'number', min: 0, max: 10, defaultValue: 7 },
      ],
    },
  ],
}
