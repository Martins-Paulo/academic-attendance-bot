import type { CollectionConfig } from 'payload'
import {
  appUserOnly,
  getRequestUser,
  isAdminRequest,
  participantAccess,
} from '@/access/appUsers'

export const Friendships: CollectionConfig = {
  slug: 'friendships',
  admin: {
    group: 'UniGag',
    useAsTitle: 'id',
  },
  access: {
    create: appUserOnly,
    delete: participantAccess('requester', 'recipient'),
    read: participantAccess('requester', 'recipient'),
    update: participantAccess('requester', 'recipient'),
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        const user = getRequestUser(req.user)
        if (operation === 'create' && user?.collection === 'users') {
          if (String(data?.recipient) === String(user.id)) {
            throw new Error('Você não pode enviar uma solicitação para si.')
          }
          return { ...data, requester: user.id, status: 'pending' }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'requester',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      access: { create: () => false, update: () => false },
    },
    {
      name: 'recipient',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: ['pending', 'accepted', 'declined', 'blocked'],
      access: { create: () => false },
    },
    {
      name: 'sharing',
      type: 'group',
      fields: [
        { name: 'attendance', type: 'checkbox', defaultValue: false },
        { name: 'deadlines', type: 'checkbox', defaultValue: true },
        { name: 'grades', type: 'checkbox', defaultValue: false },
      ],
    },
  ],
}
