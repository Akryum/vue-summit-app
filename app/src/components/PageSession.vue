<template>
  <BasePage class="page-session">
    <div v-if="session" class="session-info">
      <h1>{{ session.title }}</h1>

      <div
        v-if="session.description"
        class="session-description"
        v-html="descriptionHtml"
      />
    </div>

    <QuestionToolbar
      class="toolbar"
      @refresh="refresh"
    />

    <transition name="fade">
      <BaseLoading
        v-if="$apollo.loading"
        key="loading"
        class="raised delay"
      />
    </transition>

    <div
      key="items"
      class="items"
    >
      <div
        v-if="questions.length === 0"
        class="empty"
      >
        {{ emptyMessage }}
      </div>

      <QuestionItem
        v-for="question of questions"
        :key="question.id"
        :question="question"
      />
    </div>
  </BasePage>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { cacheQuestionAddToList, cacheQuestionRemoveFromList } from '../cache/questions'
import marked from 'marked'

import QuestionItem from './QuestionItem.vue'
import QuestionToolbar from './QuestionToolbar.vue'

import SESSION_QUERY from '../graphql/Session.gql'
import QUESTIONS_QUERY from '../graphql/Questions.gql'
import QUESTION_ADDED from '../graphql/QuestionAdded.gql'
import QUESTION_UPDATED from '../graphql/QuestionUpdated.gql'
import QUESTION_REMOVED from '../graphql/QuestionRemoved.gql'

export default {
  components: {
    QuestionItem,
    QuestionToolbar,
  },

  props: {
    sessionId: {
      type: String,
      required: true,
    },
  },

  data () {
    return {
      session: null,
      questions: [],
    }
  },

  computed: {
    ...mapGetters('questions', [
      'requestFilter',
      'requestSort',
      'searchText',
    ]),

    emptyMessage () {
      if (this.searchText) {
        return 'No results found.'
      } else {
        return 'No questions yet.'
      }
    },

    descriptionHtml () {
      return this.session && marked(this.session.description)
    },
  },

  watch: {
    sessionId: {
      handler (value, oldValue) {
        if (value !== oldValue) this.setSessionId(value)
      },
      immediate: true,
    },
  },

  apollo: {
    session: {
      query: SESSION_QUERY,
      variables () {
        return {
          id: this.sessionId,
        }
      },
      prefetch ({ route }) {
        return {
          id: route.params.sessionId,
        }
      },
    },

    questions: {
      query: QUESTIONS_QUERY,
      variables () {
        return {
          sessionId: this.sessionId,
          filter: this.requestFilter,
          sort: this.requestSort,
        }
      },
      prefetch ({ route }) {
        return {
          sessionId: route.params.sessionId,
          filter: { answered: false },
          sort: '',
        }
      },
      fetchPolicy: 'network-only',
      subscribeToMore: [
        // Updated
        {
          document: QUESTION_UPDATED,
          variables () {
            return {
              sessionId: this.sessionId,
              filter: this.requestFilter,
            }
          },
        },
        // Added
        {
          document: QUESTION_ADDED,
          variables () {
            return {
              sessionId: this.sessionId,
              filter: this.requestFilter,
            }
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            // The previous result is immutable
            const newResult = {
              questions: [...previousResult.questions],
            }

            // Add the question to the list
            cacheQuestionAddToList(newResult.questions, {
              sessionId: this.sessionId,
              filter: this.requestFilter,
              sort: this.requestSort,
            }, subscriptionData.data.questionAdded)

            return newResult
          },
        },
        // Removed
        {
          document: QUESTION_REMOVED,
          variables () {
            return {
              sessionId: this.sessionId,
              filter: this.requestFilter,
            }
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            // The previous result is immutable
            const newResult = {
              questions: [...previousResult.questions],
            }

            // Add the question to the list
            cacheQuestionRemoveFromList(newResult.questions, {
              sessionId: this.sessionId,
              filter: this.requestFilter,
              sort: this.requestSort,
            }, subscriptionData.data.questionRemoved)

            return newResult
          },
        },
      ],
    },
  },

  methods: {
    ...mapActions('questions', [
      'setSessionId',
    ]),

    refresh () {
      this.$apollo.queries.questions.refetch()
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-loading
  position fixed
  top 12px
  left 0
  right 0

.toolbar
  margin-bottom 24px

.question-item
  margin-bottom 12px

.session-info
  margin-bottom 32px
</style>
