import { createServerFn } from '@tanstack/react-start'

import { fetchDrawings, fetchPhotos, fetchProjects } from '@/lib/strapi'

export const getDrawings = createServerFn({ method: 'GET' }).handler(() => fetchDrawings())

export const getPhotos = createServerFn({ method: 'GET' }).handler(() => fetchPhotos())

export const getProjects = createServerFn({ method: 'GET' }).handler(() => fetchProjects())
