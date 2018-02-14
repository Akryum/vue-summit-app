<template>
  <div id="app">
    <AppHeader/>
    <router-view/>
    <AppFooter/>

    <transition name="right-pane" duration="800">
      <QuestionAddPane v-if="showQuestionPane"/>
      <SessionAddPane v-else-if="showSessionPane"/>
      <AnswersPane v-else-if="showAnswerPane" v-bind="showAnswerPane"/>
    </transition>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import QuestionAddPane from './QuestionAddPane.vue'
import SessionAddPane from './SessionAddPane.vue'
import AnswersPane from './AnswersPane.vue'

export default {
  components: {
    AppHeader,
    AppFooter,
    QuestionAddPane,
    SessionAddPane,
    AnswersPane,
  },

  computed: {
    ...mapGetters('ui', [
      'showQuestionPane',
      'showSessionPane',
      'showAnswerPane',
    ]),
  },
}
</script>

<style lang="stylus">
@import '../styles/main';
</style>
