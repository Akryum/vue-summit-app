import express from 'express'
import session from 'express-session'
import NedbStore from 'nedb-session-store'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import uuid from 'uuid/v4'
import { createServer } from 'http'
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express'
import { getDb } from './utils/db'
import passport from 'passport'
import path from 'path'

import './passport'

// Subs
import { execute, subscribe } from 'graphql'
import { SubscriptionServer } from 'subscriptions-transport-ws'

import schema from './graphql/schema'

import { PORT, SUBSCRIPTIONS_PATH, CLIENT_ORIGIN, NEDB_PATH, SECRET } from './config'

async function main () {
  const db = await getDb()

  await db.collection('user').createIndex({
    userId: 1,
  })

  await db.collection('questions').createIndex({
    name: 'text',
    description: 'text',
  })

  const app = express()

  const NedbSessionStore = NedbStore(session)
  const sessionStore = new NedbSessionStore({
    filename: path.join(NEDB_PATH, 'session-store.db'),
  })

  app.use(cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }))

  app.use(cookieParser(SECRET))

  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())

  app.use(session({
    genid: () => uuid(),
    key: 'express.sid',
    secret: SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 3 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    },
    store: sessionStore,
  }))

  app.use(passport.initialize())
  app.use(passport.session())

  app.use('/graphql', graphqlExpress(req => {
    return ({
      schema,
      context: { user: req.user },
    })
  }))

  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
  }))

  // Auth
  app.get('/logout', (req, res) => {
    req.logout()
    res.json({ status: 'ok' })
  })

  app.get('/auth/google', passport.authenticate(
    'google',
    {
      scope: ['https://www.googleapis.com/auth/plus.login'],
      display: 'popup',
    }
  ))

  app.get('/auth/google/callback', passport.authenticate(
    'google',
  ), (req, res) => {
    res.send(`<html>
    <body>
      <script>
        window.opener.postMessage('success', '${CLIENT_ORIGIN}')
        window.close()
      </script>
      Success!
    </body>
    </html>`)
  })

  const server = createServer(app)

  server.listen(PORT, () => {
    console.log(`API Server is now running on http://localhost:${PORT}/graphql`)
    console.log(`API Subscriptions server is now running on ws://localhost:${PORT}${SUBSCRIPTIONS_PATH}`)
  })

  // Subs
  SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server,
      path: SUBSCRIPTIONS_PATH,
    }
  )
}

main()
