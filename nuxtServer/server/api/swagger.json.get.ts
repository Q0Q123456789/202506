import { swaggerSpec } from '../utils/swagger'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'application/json')
  return swaggerSpec
})

