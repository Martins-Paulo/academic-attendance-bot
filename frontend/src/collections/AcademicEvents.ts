import type { CollectionConfig } from 'payload'
import {
  appUserOnly,
  getRequestUser,
  isAdminRequest,
  participantAccess,
} from '@/access/appUsers'

export const AcademicEvents: CollectionConfig = {
  slug: 'academic-events',
  admin: { group: 'UniGag', useAsTitle: 'title' },
  access: {
    create: appUserOnly,
    delete: participantAccess('owner'),
    read: participantAccess('owner', 'sharedWith'),
    update: participantAccess('owner'),
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
      index: true,
      access: { create: () => false, update: () => false },
    },
    { name: 'title', type: 'text', required: true },
    { name: 'subject', type: 'text' },
    { name: 'startsAt', type: 'date', required: true },
    { name: 'endsAt', type: 'date' },
    {
      name: 'eventType',
      type: 'select',
      required: true,
      options: ['class', 'exam', 'assignment', 'study', 'free'],
    },
    { name: 'sharedWith', type: 'relationship', relationTo: 'users', hasMany: true },
  ],
}
