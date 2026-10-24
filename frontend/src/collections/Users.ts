import type { CollectionConfig } from 'payload'
import { adminOrOwn, isAdminRequest } from '@/access/appUsers'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    hidden: true,
    useAsTitle: 'displayName',
  },
  access: {
    create: () => true,
    delete: adminOrOwn,
    read: adminOrOwn,
    update: adminOrOwn,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
      required: true,
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'student',
      options: [{ label: 'Estudante', value: 'student' }],
      access: {
        create: ({ req }) => isAdminRequest(req.user),
        update: ({ req }) => isAdminRequest(req.user),
      },
    },
  ],
}
