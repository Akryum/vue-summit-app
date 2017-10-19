import Vue from 'vue'
import VueRouter from 'vue-router'

import PageHome from './components/PageHome.vue'
import PageNotFound from './components/PageNotFound.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'home', component: PageHome },
  { path: '*', component: PageNotFound },
]

export function createRouter () {
  const router = new VueRouter({
    routes,
    mode: 'history',
    scrollBehavior (to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      }
      if (to.hash) {
        return { selector: to.hash }
      }
      return { x: 0, y: 0 }
    },
  })

  return router
}
