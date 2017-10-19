<template>
  <BasePage class="page-home">
    <div class="toolbar">
      <BaseButtonGroup v-model="filterModel">
        <BaseButton :value="null">All</BaseButton>
        <BaseButton value="new">New</BaseButton>
        <BaseButton value="answered">Answered</BaseButton>
        <!-- <BaseButton v-if="user" value="mine">Mine</BaseButton> -->
      </BaseButtonGroup>

      <div class="more-actions">
        <BaseButtonGroup v-model="sortModel">
          <BaseButton value="">Popular</BaseButton>
          <BaseButton value="newer">Recent</BaseButton>
        </BaseButtonGroup>

        <BaseButton
          class="icon-button secondary"
          icon="refresh"
          @click="refresh"
        />
      </div>
    </div>

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
import { mapGetters, mapActions } from 'vuex'
import { cacheQuestionAddToList, cacheQuestionRemoveFromList } from '../cache/questions'

import QuestionItem from './QuestionItem.vue'

import QUESTIONS_QUERY from '../graphql/Questions.gql'
import QUESTION_ADDED from '../graphql/QuestionAdded.gql'
import QUESTION_UPDATED from '../graphql/QuestionUpdated.gql'
import QUESTION_REMOVED from '../graphql/QuestionRemoved.gql'

export default {
  components: {
    QuestionItem,
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
      'filter',
      'sort',
      'requestFilter',
      'requestSort',
    ]),

    ...mapGetters('user', [
      'user',
    ]),

    filterModel: {
      get () { return this.filter },
      set (value) { this.setFilter(value) },
    },

    sortModel: {
      get () { return this.sort },
      set (value) { this.setSort(value) },
    },
  },

  methods: {
    ...mapActions('questions', [
      'setFilter',
      'setSort',
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
  height 200px
  margin-bottom: -200px

.toolbar
  h-box()
  align-items center
  justify-content space-between
  margin-bottom 24px

  .base-button-group
    flex auto 0 0

  .more-actions
    h-box()
    box-center()

    >>> > *
      space-between-x(6px)

.question-item
  margin-bottom 12px
</style>
