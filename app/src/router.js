import Vue from 'vue'
import VueRouter from 'vue-router'

import PageHome from './components/PageHome.vue'
import PageSession from './components/PageSession.vue'
import PageMe from './components/PageMe.vue'
import PageAdmin from './components/PageAdmin.vue'
import PageNotFound from './components/PageNotFound.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'home', component: PageHome },
  { path: '/sessions/:sessionId', name: 'session', component: PageSession, props: true },
  { path: '/me', name: 'me', component: PageMe },
  { path: '/admin', name: 'admin', component: PageAdmin },
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
