// Express
import { createServer } from 'http'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import cookieSession from 'cookie-session'
import bodyParser from 'body-parser'
import passport from 'passport'
import compression from 'compression'

// Apollo
import { graphqlExpress } from 'apollo-server-express'

// Graphcool Playground
import expressPlayground from 'graphql-playground-middleware-express'

// Apollo Subs
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

// Apollo Engine (Monitoring, Caching, Errors reporting)
import { Engine } from 'apollo-engine'

// GraphQL Executable Schema
import schema from '../graphql/schema'

// Config
import {
  PORT,
  SUBSCRIPTION_ENDPOINT,
  CLIENT_ORIGIN,
  SECRET,
  COOKIE_DOMAIN,
  COOKIE_NAME,
  PUBLIC_URL,
  ENGINE_KEY,
  GRAPHQL_ENDPOINT,
  PLAYGROUND_ENDPOINT,
} from '../config'

const subscriptionsEndpoint = `ws${PUBLIC_URL.replace('http', '')}${SUBSCRIPTION_ENDPOINT}`

function setupEngine (app) {
  const engine = new Engine({
    engineConfig: {
      apiKey: ENGINE_KEY,
      logging: {
        level: process.env.NODE_ENV === 'production' ? 'WARN' : 'INFO',
      },
      'stores': [
        {
          'name': 'publicResponseCache',
          'inMemory': {
            'cacheSize': 10485760,
          },
        },
        {
          'name': 'persistedQueries',
          'inMemory': {
            'cacheSize': 5000000,
          },
        },
      ],
      'queryCache': {
        'publicFullQueryStore': 'publicResponseCache',
      },
      'persistedQueries': {
        'store': 'persistedQueries',
      },
    },
    graphqlPort: PORT,
    endpoint: GRAPHQL_ENDPOINT,
    // dumpTraffic: process.env.NODE_ENV !== 'production',
  })

  engine.start()

  app.use(engine.expressMiddleware())
}

function setupCors (app) {
  app.use(cors({
    origin: CLIENT_ORIGIN,
    // Ask for auth cookie
    credentials: true,
  }))
}

function setupParsers (app) {
  app.use(cookieParser(SECRET))
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
}

function setupSession (app) {
  app.use(cookieSession({
    name: COOKIE_NAME,
    keys: [SECRET],
    maxAge: 3 * 60 * 60 * 1000,
    // secure: process.env.NODE_ENV === 'production',
    secure: false,
    domain: COOKIE_DOMAIN,
  }))
  app.use(passport.initialize())
  app.use(passport.session())
}

function setupCompression (app) {
  app.use(compression({ threshold: 0 }))
}

function setupGraphQL (app) {
  app.use(GRAPHQL_ENDPOINT, graphqlExpress(req => {
    return ({
      schema,
      // Set the context for all resolvers
      context: {
        // Current user
        user: req.user,
      },
      // Apollo Engine flags
      tracing: true,
      cacheControl: false,
    })
  }))

  app.use(PLAYGROUND_ENDPOINT, expressPlayground({
    endpoint: GRAPHQL_ENDPOINT,
    subscriptionEndpoint: SUBSCRIPTION_ENDPOINT,
  }))
}

function setupAuth (app) {
  app.get('/logout', (req, res) => {
    req.logout()
    res.clearCookie(COOKIE_NAME)
    res.clearCookie(`${COOKIE_NAME}.sig`)
    res.redirect(CLIENT_ORIGIN)
  })

  app.get('/auth/google', passport.authenticate(
    'google',
    {
      scope: ['https://www.googleapis.com/auth/plus.login'],
    }
  ))

  app.get('/auth/google/callback', passport.authenticate(
    'google',
  ), (req, res) => {
    res.redirect(CLIENT_ORIGIN)
  })
}

function setupGraphQLSubs (server) {
  // eslint-disable-next-line no-new
  new SubscriptionServer(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server,
      path: SUBSCRIPTION_ENDPOINT,
    }
  )
}

export default async function () {
  const app = express()
  setupEngine(app) // Engine needs to be applied first (it's a proxy)
  setupCors(app)
  setupParsers(app)
  setupSession(app)
  setupCompression(app)
  setupGraphQL(app)
  setupAuth(app)

  const server = createServer(app)

  server.listen(PORT, () => {
    setupGraphQLSubs(server)

    console.log(`API Server is now running on http://${PUBLIC_URL}${GRAPHQL_ENDPOINT}`)
    console.log(`API Subscriptions server is now running on ${subscriptionsEndpoint}`)
  })
}
