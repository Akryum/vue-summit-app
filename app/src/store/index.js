import Vue from 'vue'
import Vuex from 'vuex'

import questions from './questions'
import ui from './ui'
import user from './user'

Vue.use(Vuex)

export function createStore () {
  const store = new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',

    actions: {
      init () {
        // Implement this root action in module
      },
    },

    modules: {
      questions,
      ui,
      user,
    },
  })

  // Webpack HRM
  if (module.hot) {
    module.hot.accept([
      './questions',
      './ui',
      './user',
    ], () => {
      store.hotUpdate({
        modules: {
          questions: require('./questions').default,
          ui: require('./ui').default,
          user: require('./user').default,
        },
      })
    })
  }

  return store
}
