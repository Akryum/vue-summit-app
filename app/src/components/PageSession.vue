<template>
  <BasePage class="page-session">
    <div class="session-info">
      <div class="info-header">
        <h1 class="title">{{ session && session.title }}</h1>
        <div class="avatar">
          <img
            v-if="session && session.user.avatar"
            class="img"
            :src="session.user.avatar"
          >
        </div>

        <div class="name">{{ session && session.user.name }}</div>
      </div>

      <div class="more-info">
        <div
          v-if="session && session.description"
          class="session-description"
          v-html="descriptionHtml"
        />

        <div class="session-data">
          <span class="info date">
            <BaseIcon icon="schedule"/>
            <BaseTimeAgo v-if="session" :date="session.date"/>
          </span>

          <span class="info question-count">
            <BaseIcon icon="forum"/>
            <span v-if="session">{{ session.questionCount }} question{{ session.questionCount > 1 ? 's' : '' }}</span>
          </span>
        </div>
      </div>
    </div>

    <div v-if="session && !session.public" class="info-block warning">
      <BaseIcon icon="warning"/>
      <div>This Session is currently private. After being validated by our team, it will be automatically published.</div>
    </div>

    <QuestionToolbar
      class="toolbar"
      v-sticky="user && { zIndex: 10, marginTop: 42 }"
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
        :session="session"
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

    ...mapGetters('user', [
      'user',
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
  top 10px
  left 0
  right 0

.toolbar
  margin-bottom 24px

.items
  min-height 400px

.question-item
  margin-bottom 12px

.session-info
  margin-bottom 32px
  box-shadow 0 0 10px rgba(black, 0.1)

  .info-header
    v-box()
    box-center()
    background rgba($color-secondary, 1)
    color $md-white
    padding 32px
    margin-top 12px
    border-radius 3px 3px 0 0

    >>> > *
      space-between-y(8px)

    .title
      margin-top 0
      margin-bottom 24px

    .avatar
      width 64px
      height @width

    .name
      font-size 20px

  .more-info
    background darken($color-secondary, 20%)
    color rgba($md-white, .5)
    padding 32px 32px 24px
    border-radius 0 0 3px 3px

  .session-data
    h-box()
    box-center()

    .info
      space-between-x(32px)

      .icon
        margin-right 4px

  .session-description
    color $md-white
    padding 18px 24px
    border-radius 3px
    background $color-secondary
    color $md-white
    box-shadow 0 0 20px rgba(black, .05)
    margin-bottom 24px
    position relative
    min-height 3em

    &::before
      display block
      content ''
      position absolute
      top -12px
      left calc(50% - 12px)
      width 0
      height 0
      border-style solid
      border-color transparent transparent @background transparent
      border-width 0 12px 12px 12px

</style>
