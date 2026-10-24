import type { Access, Where } from 'payload'

type RequestUser = {
  collection?: string
  id: string | number
} | null

export const getRequestUser = (user: unknown) => user as RequestUser

export const isAdminRequest = (user: unknown) => getRequestUser(user)?.collection === 'admins'

export const isAppUserRequest = (user: unknown) => getRequestUser(user)?.collection === 'users'

export const appUserOnly: Access = ({ req }) => isAppUserRequest(req.user)

export const adminOrOwn: Access = ({ req }) => {
  if (isAdminRequest(req.user)) return true
  const user = getRequestUser(req.user)
  if (user?.collection !== 'users') return false
  return { id: { equals: user.id } }
}

export const participantAccess =
  (...fields: string[]): Access =>
  ({ req }) => {
    if (isAdminRequest(req.user)) return true
    const user = getRequestUser(req.user)
    if (user?.collection !== 'users') return false
    return {
      or: fields.map((field) => ({ [field]: { equals: user.id } })),
    } as Where
  }
