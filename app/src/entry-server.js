import { createApp } from './app'
import fetch from 'node-fetch'
import USER_QUERY from './graphql/CurrentUser.gql'

global.fetch = fetch

export default context => {
  return new Promise(async (resolve, reject) => {
    const { app, router, store, apolloProvider } = await createApp({
      ...context,
      ssr: true,
    })

    // Preload the user
    try {
      const result = await apolloProvider.defaultClient.query({
        query: USER_QUERY,
      })
      const user = result.data.currentUser
      console.log(user)
      if (user) {
        store.commit('user/user', user)
      }
    } catch (e) {
      console.error(e)
    }

    // Update route
    router.push(context.req.url)

    router.onReady(() => {
      const matchedComponents = router.getMatchedComponents()

      if (
        matchedComponents.length === 0 ||
        matchedComponents.some(
          component => component.name === 'not-found-page'
        )
      ) {
        context.httpCode = 404
      }

      Promise.all([
        // Async data
        ...matchedComponents.map(Component => {
          if (Component.asyncData) {
            return Component.asyncData({
              store,
              route: router.currentRoute,
            })
          }
        }),
        // Apollo data
        apolloProvider.prefetchAll({
          route: router.currentRoute,
        }, matchedComponents),
      ]).then(() => {
        // After all preFetch hooks are resolved, our store is now
        // filled with the state needed to render the app.
        // When we attach the state to the context, and the `template` option
        // is used for the renderer, the state will automatically be
        // serialized and injected into the HTML as `window.__INITIAL_STATE__`.
        context.state = store.state

        // Inject to `window.__APOLLO_STATE__`
        context.apollo = apolloProvider.getStates()

        resolve(app)
      }).catch(reject)
    }, reject)
  })
}
