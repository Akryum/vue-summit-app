<template>
  <div id="app">
    <AppHeader />
    <router-view />
    <AppFooter />

    <transition name="right-pane" duration="800">
      <QuestionAddPane v-if="showAddQuestion" />
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import QuestionAddPane from './QuestionAddPane.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    QuestionAddPane,
  },

  computed: {
    ...mapGetters('ui', [
      'showAddQuestion',
    ]),
  },
}
</script>

<style lang="stylus">
@import '../styles/main';
</style>
