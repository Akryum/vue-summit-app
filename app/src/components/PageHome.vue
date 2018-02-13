<template>
  <BasePage class="page-home">
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
import { mapGetters } from 'vuex'
import { cacheQuestionAddToList, cacheQuestionRemoveFromList } from '../cache/questions'

import QuestionItem from './QuestionItem.vue'
import QuestionToolbar from './QuestionToolbar.vue'

import QUESTIONS_QUERY from '../graphql/Questions.gql'
import QUESTION_ADDED from '../graphql/QuestionAdded.gql'
import QUESTION_UPDATED from '../graphql/QuestionUpdated.gql'
import QUESTION_REMOVED from '../graphql/QuestionRemoved.gql'

export default {
  components: {
    QuestionItem,
    QuestionToolbar,
  },

  data () {
    return {
      questions: [],
    }
  },

  apollo: {
    questions: {
      query: QUESTIONS_QUERY,
      variables () {
        return {
          filter: this.requestFilter,
          sort: this.requestSort,
        }
      },
      prefetch: {
        filter: { answered: false },
        sort: '',
      },
      fetchPolicy: 'network-only',
      subscribeToMore: [
        // Updated
        {
          document: QUESTION_UPDATED,
          variables () {
            return {
              filter: this.requestFilter,
            }
          },
        },
        // Added
        {
          document: QUESTION_ADDED,
          variables () {
            return {
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
              filter: this.requestFilter,
            }
          },
          updateQuery: (previousResult, { subscriptionData }) => {
            // The previous result is immutable
            const newResult = {
              questions: [...previousResult.questions],
            }

            // Add the question to the list
            cacheQuestionRemoveFromList(newResult.questions, {}, subscriptionData.data.questionRemoved)

            return newResult
          },
        },
      ],
    },
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
  },

  methods: {
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
</style>
