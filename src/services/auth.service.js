import { api } from './api'

export async function login(email, password) {
  // confirmar el endpoint y el formato exacto de request/response
  // cuando la autenticación en NexusBack esté lista.
  return api.post('/auth/login/', { email, password })
}