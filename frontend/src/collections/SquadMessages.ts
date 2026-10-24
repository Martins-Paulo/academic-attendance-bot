import type { CollectionConfig } from 'payload'
import {
  appUserOnly,
  getRequestUser,
  participantAccess,
} from '@/access/appUsers'

export const SquadMessages: CollectionConfig = {
  slug: 'squad-messages',
  admin: { group: 'UniGag', useAsTitle: 'message' },
  access: {
    create: appUserOnly,
    delete: participantAccess('author'),
    read: participantAccess('author', 'recipients'),
    update: participantAccess('author'),
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const user = getRequestUser(req.user)
        if (operation === 'create' && user?.collection === 'users') {
          return { ...data, author: user.id }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: 'recipients',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      required: true,
    },
    { name: 'message', type: 'textarea', required: true, maxLength: 500 },
    {
      name: 'messageType',
      type: 'select',
      defaultValue: 'note',
      options: ['note', 'deadline', 'cancelled-class'],
    },
  ],
}
