<template>
  <div id="app">
    <AppHeader/>
    <router-view/>
    <AppFooter/>

    <transition name="right-pane" duration="800">
      <QuestionAddPane v-if="showAddQuestion"/>
      <SessionAddPane v-else-if="showAddSession"/>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import QuestionAddPane from './QuestionAddPane.vue'
import SessionAddPane from './SessionAddPane.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    QuestionAddPane,
    SessionAddPane,
  },

  computed: {
    ...mapGetters('ui', [
      'showAddQuestion',
      'showAddSession',
    ]),
  },
}
</script>

<style lang="stylus">
@import '../styles/main';
</style>
