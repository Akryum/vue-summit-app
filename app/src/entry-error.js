import Vue from 'vue'
import './components'
import App from './components/PageServerError.vue'

export default context => {
  return new Vue({
    render (h) {
      return h(App, {
        props: {
          error: context.error,
        },
      })
    },
  })
}
