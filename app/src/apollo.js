import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import { createPersistedQueryLink } from 'apollo-link-persisted-queries'
import VueApollo from 'vue-apollo'
import { ENDPOINT } from './config'

// Install the vue plugin
Vue.use(VueApollo)

// Create the apollo client
export function createApolloClient ({ ssr, req }) {
  let link

  const httpLink = createPersistedQueryLink().concat(
    new HttpLink({
      // You should use an absolute URL here
      uri: ENDPOINT + '/graphql',
      credentials: 'include',
      ...(ssr ? {
        headers: {
          cookie: req.header('Cookie'),
        },
      } : {}),
    })
  )

  const cache = new InMemoryCache()

  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        cache.restore(state.defaultClient)
      }
    }

    // Create the subscription websocket link
    const wsLink = new WebSocketLink({
      uri: ENDPOINT.replace(/^https?/i, 'ws' + (process.env.NODE_ENV === 'production' ? 's' : '')) +
      '/subscriptions',
      options: {
        reconnect: true,
      },
    })

    // using the ability to split links, you can send data to each link
    // depending on what kind of operation is being sent
    link = split(
      // split based on operation type
      ({ query }) => {
        const { kind, operation } = getMainDefinition(query)
        return kind === 'OperationDefinition' &&
          operation === 'subscription'
      },
      wsLink,
      httpLink
    )
  } else {
    link = httpLink
  }

  const apolloClient = new ApolloClient({
    link,
    cache,
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true,
    } : {
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
      // Apollo devtools
      connectToDevTools: process.env.NODE_ENV !== 'production',
    }),
  })

  return apolloClient
}
