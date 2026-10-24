export type MakeSiteSettings = {
  title?: string
  description?: string
  lang?: string
  headCustomCode?: string
  bodyCustomCode?: string
  [key: string]: any
}

export const rawSiteSettings: MakeSiteSettings = {
  title: 'UniGag - Gestor Acadêmico & Conexão Universitária',
  description: 'Gagging over good grades & zero missing classes.',
  lang: 'pt-BR',
}

export const makeSiteSettings = rawSiteSettings

export function sanitizeHtmlAttribute(value: string | undefined | null): string {
  if (!value) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default makeSiteSettings