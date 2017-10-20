<template>
  <BasePage class="page-home">
    <QuestionToolbar
      class="toolbar"
      @refresh="refresh"
    />

    <transition name="fade">
      <BaseLoading
        v-if="loading"
        key="loading"
      />
      <div
        v-else
        key="items"
        class="items"
      >
        <div
          v-if="questions.length === 0"
          class="empty"
        >
          No questions yet.
        </div>

        <QuestionItem
          v-for="question of questions"
          :key="question.id"
          :question="question"
        />
      </div>
    </transition>
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
      loading: 0,
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
      loadingKey: 'loading',
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
    ]),
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
  height 200px
  margin-bottom: -200px

.toolbar
  margin-bottom 24px

.question-item
  margin-bottom 12px
</style>
