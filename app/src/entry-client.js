import { createApp } from './app'
createApp({
  ssr: false,
}).then(({ app, store }) => {
  // Restore the Vuex store state
  // if send by the server
  if (window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }

  // Mount the app into the page
  app.$mount('#app')
})

// service worker
if (location.protocol === 'https:' && navigator.serviceWorker) {
  navigator.serviceWorker.register('/service-worker.js')
}
