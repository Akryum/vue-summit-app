import Vue from 'vue'
import { ApolloClient, createBatchingNetworkInterface } from 'apollo-client'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import VueApollo from 'vue-apollo'
import { ENDPOINT } from './config'

// Install the vue plugin
Vue.use(VueApollo)

// Create the apollo client
export function createApolloClient ({ ssr, req }) {
  let initialState

  let networkInterface = createBatchingNetworkInterface({
    // You should use an absolute URL here
    uri: ENDPOINT + '/graphql',
    opts: {
      credentials: 'include',
      ...(ssr ? {
        headers: {
          cookie: req.header('Cookie'),
        },
      } : {}),
    },
  })

  if (!ssr) {
    // If on the client, recover the injected state
    if (typeof window !== 'undefined') {
      const state = window.__APOLLO_STATE__
      if (state) {
        // If you have multiple clients, use `state.<client_id>`
        initialState = state.defaultClient
      }
    }

    // Create the subscription websocket client
    const wsClient = new SubscriptionClient(ENDPOINT.replace(/^https?/i, 'ws') + '/subscriptions', {
      reconnect: true,
    })

    networkInterface = addGraphQLSubscriptions(
      networkInterface,
      wsClient,
    )
  }

  const apolloClient = new ApolloClient({
    networkInterface,
    ...(ssr ? {
      // Set this on the server to optimize queries when SSR
      ssrMode: true,
    } : {
      // Inject the state on the client
      initialState,
      // This will temporary disable query force-fetching
      ssrForceFetchDelay: 100,
    }),
  })

  return apolloClient
}
