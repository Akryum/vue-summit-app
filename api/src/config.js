// Explicit
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const MONGO_URL = process.env.MONGO_URL
export const ENGINE_KEY = process.env.ENGINE_KEY

// Have Defaults
export const PORT = process.env.PORT || 3000
export const SECRET = process.env.SECRET || 'ERFEç5@67_U6-RTA-F56'
export const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:8080'
export const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:3000'
export const SUBSCRIPTIONS_PATH = process.env.SUBSCRIPTIONS_PATH || '/subscriptions'
export const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined
export const GRAPHQL_ENDPOINT = process.env.GRAPHQL_ENDPOINT || '/graphql'
export const GRAPHIQL_ENDPOINT = process.env.GRAPHIQL_ENDPOINT || '/graphiql'
export const DB_NAME = process.env.DB_NAME || 'devfest-nantes-2017'
