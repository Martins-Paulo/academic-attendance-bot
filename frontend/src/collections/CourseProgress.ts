import type { CollectionConfig } from 'payload'
import { appUserOnly, getRequestUser, participantAccess } from '@/access/appUsers'

export const CourseProgress: CollectionConfig = {
  slug: 'course-progress',
  admin: { group: 'UniGag', useAsTitle: 'subject' },
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
    { name: 'subject', type: 'text', required: true, index: true },
    { name: 'attendance', type: 'number', min: 0, max: 100, required: true },
    { name: 'accumulatedGrade', type: 'number', min: 0, max: 10 },
    { name: 'sharedWith', type: 'relationship', relationTo: 'users', hasMany: true },
  ],
}
