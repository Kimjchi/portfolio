// ─── Normalized types (what the app uses) ────────────────────────────────────

export interface StrapiMedia {
  id: number
  url: string
  alternativeText: string | null
  width: number
  height: number
}

export interface Drawing {
  id: number
  title: string
  image: StrapiMedia
}

export interface Photo {
  id: number
  description: string
  photo: StrapiMedia
}

export interface Project {
  id: number
  title: string
  url: string
  description: string
  client: string
  content: string
  screenshots: Array<StrapiMedia>
}

// ─── Raw Strapi v4 response types ────────────────────────────────────────────

interface RawMedia {
  id: number
  attributes: {
    url: string
    alternativeText: string | null
    width: number
    height: number
  }
}

interface RawRelation<T> {
  data: T | null
}

interface RawDrawingAttributes {
  title: string
  image: RawRelation<RawMedia>
}

interface RawPhotoAttributes {
  description: string
  photo: RawRelation<RawMedia>
}

interface RawProjectAttributes {
  title: string
  URL: string
  description: string
  client: string
  content: string
  screenshots: RawRelation<Array<RawMedia>>
}

interface RawItem<T> {
  id: number
  attributes: T
}

interface StrapiResponse<T> {
  data: Array<RawItem<T>>
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number }
  }
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function normalizeMedia(raw: RawMedia): StrapiMedia {
  const baseUrl = process.env['STRAPI_URL'] ?? ''
  const rawUrl = raw.attributes.url
  return {
    id: raw.id,
    url: rawUrl.startsWith('http') ? rawUrl : `${baseUrl}${rawUrl}`,
    alternativeText: raw.attributes.alternativeText,
    width: raw.attributes.width,
    height: raw.attributes.height,
  }
}

function normalizeDrawing(raw: RawItem<RawDrawingAttributes>): Drawing {
  return {
    id: raw.id,
    title: raw.attributes.title,
    image: normalizeMedia(raw.attributes.image.data!),
  }
}

function normalizePhoto(raw: RawItem<RawPhotoAttributes>): Photo {
  return {
    id: raw.id,
    description: raw.attributes.description,
    photo: normalizeMedia(raw.attributes.photo.data!),
  }
}

function normalizeProject(raw: RawItem<RawProjectAttributes>): Project {
  return {
    id: raw.id,
    title: raw.attributes.title,
    url: raw.attributes.URL,
    description: raw.attributes.description,
    client: raw.attributes.client,
    content: raw.attributes.content,
    screenshots: (raw.attributes.screenshots.data ?? []).map(normalizeMedia),
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function strapiImageUrl(media: StrapiMedia): string {
  const baseUrl = process.env['STRAPI_URL'] ?? ''
  return media.url.startsWith('http') ? media.url : `${baseUrl}${media.url}`
}

async function strapiFetch<TRaw, TNorm>(
  path: string,
  normalize: (raw: RawItem<TRaw>) => TNorm,
): Promise<Array<TNorm>> {
  const baseUrl = process.env['STRAPI_URL']
  const token = process.env['STRAPI_API_TOKEN']

  if (!baseUrl || !token) {
    throw new Error('STRAPI_URL and STRAPI_API_TOKEN must be set in your .env file')
  }

  const res = await fetch(`${baseUrl}/api/${path}?populate=*`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`Strapi fetch failed: ${res.status} ${res.statusText}`)
  }

  const json: StrapiResponse<TRaw> = await res.json()
  return json.data.map(normalize)
}

// ─── Public fetch functions ───────────────────────────────────────────────────

export const fetchDrawings = () =>
  strapiFetch<RawDrawingAttributes, Drawing>('drawings', normalizeDrawing)

export const fetchPhotos = () =>
  strapiFetch<RawPhotoAttributes, Photo>('photos', normalizePhoto)

export const fetchProjects = () =>
  strapiFetch<RawProjectAttributes, Project>('projects', normalizeProject)
