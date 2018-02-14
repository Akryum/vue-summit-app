<template>
  <div class="question-item" :class="cssClass">

    <!-- Author Avatar -->
    <div class="avatar">
      <img
        v-if="question.user.avatar"
        class="img"
        :src="question.user.avatar"
      >
    </div>

    <!-- Question content -->
    <div class="content">
      <div class="header">
        <span class="title">{{ question.title }}</span>
      </div>

      <div class="text" v-html="contentHtml"/>

      <div class="info">
        <span class="author">{{ question.user.name }}</span>
        <span class="date">
          <BaseIcon icon="schedule"/>
          <BaseTimeAgo :date="question.date"/>
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="user && !hideActions" class="actions">
      <template v-if="question.user.id === user.id || user.admin">
        <BaseButton
          icon="done"
          class="icon-button secondary"
          :class="{
            selected: question.answered,
          }"
          title="Mark as answered"
          @click.prevent="toggleAnswered"
        />
      </template>

      <div v-else-if="question.answered" class="answered">
        <BaseIcon icon="done"/> <span class="lb">Answered</span>
      </div>

      <template v-if="user.admin">
        <BaseButton
          icon="delete"
          class="icon-button secondary"
          @click.prevent="removeQuestion"
        />
      </template>

      <BaseButton
        icon="comment"
        class="secondary"
        title="Show and add comments"
        :disabled="!session"
        @click.prevent="setShowAnswer(question.id)"
      >
        {{ question.answerCount }}
      </BaseButton>

      <BaseButton
        icon="thumb_up"
        class="secondary"
        :class="{
          selected: question.hasVoted,
        }"
        title="Upvote"
        @click.prevent="toggleVoted"
      >
        {{ question.votes }}
      </BaseButton>
    </div>

    <div v-else class="guest-info">
      <div v-if="question.answered" class="answered">
        <BaseIcon icon="done"/> <span class="lb">Answered</span>
      </div>

      <div class="votes">
        <BaseIcon icon="thumb_up"/> {{ question.votes }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { cacheQuestionRemove } from '../cache/questions'
import marked from 'marked'

import QUESTION_TOGGLE_VOTED from '../graphql/QuestionToggleVoted.gql'
import QUESTION_TOGGLE_ANSWERED from '../graphql/QuestionToggleAnswered.gql'
import QUESTION_REMOVE from '../graphql/QuestionRemove.gql'

export default {
  props: {
    question: {
      type: Object,
      required: true,
    },

    session: {
      type: Object,
      default: null,
    },

    hideActions: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),

    ...mapGetters('questions', [
      'sessionId',
      'requestFilter',
      'requestSort',
    ]),

    cssClass () {
      return {
        answered: this.question.answered,
        'has-voted': this.question.hasVoted,
        'has-votes': this.question.votes > 0,
      }
    },

    contentHtml () {
      return marked(this.question.content)
    },
  },

  methods: {
    ...mapActions('ui', [
      'setShowAnswerPane',
    ]),

    toggleAnswered () {
      this.$apollo.mutate({
        mutation: QUESTION_TOGGLE_ANSWERED,
        variables: {
          id: this.question.id,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          questionToggleAnswered: {
            __typename: 'Question',
            id: this.question.id,
            answered: !this.question.answered,
          },
        },
      })
    },

    toggleVoted () {
      const newVotes = this.question.hasVoted
        ? this.question.votes - 1
        : this.question.votes + 1
      const newHasVoted = !this.question.hasVoted

      this.$apollo.mutate({
        mutation: QUESTION_TOGGLE_VOTED,
        variables: {
          id: this.question.id,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          questionToggleVoted: {
            __typename: 'Question',
            id: this.question.id,
            votes: newVotes,
            hasVoted: newHasVoted,
          },
        },
      })
    },

    removeQuestion () {
      if (!confirm('Confirm delete?')) return

      this.$apollo.mutate({
        mutation: QUESTION_REMOVE,
        variables: {
          id: this.question.id,
        },
        // Update the cache
        update: (store, { data: { questionRemove } }) => {
          cacheQuestionRemove(store, {
            sessionId: this.sessionId,
            filter: this.requestFilter,
            sort: this.requestSort,
          }, questionRemove)
        },
        optimisticResponse: {
          __typename: 'Mutation',
          questionRemove: {
            __typename: 'Question',
            id: this.question.id,
          },
        },
      })
    },

    setShowAnswer () {
      if (this.session) {
        this.setShowAnswerPane({
          question: this.question,
          session: this.session,
        })
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.question-item
  padding 24px 32px
  h-box()
  align-items stretch
  border-radius 3px

  @media (max-width: $small-screen)
    padding 12px

  .content
    margin 4px 0
    margin-right 24px
    flex auto 1 1
    width 0

    @media (max-width: $small-screen)
      margin-right 12px

    .title
      font-size 1.4em
      font-weight lighter

    .text
      white-space pre-pre-wrap
      margin-bottom 6px

    .title,
    .text
      word-wrap break-word

  .info
    color rgba($md-white, .5)
    font-size 0.8em

    >>> > span
      margin-right 12px

      .icon
        margin-right 4px

  .avatar
    margin-right 24px
    margin-top 6px

    @media (max-width: $small-screen)
      margin-right 12px

  .actions,
  .guest-info
    h-box()
    box-center()

  .guest-info
    color rgba($md-white, .5)

    >>> > div
      margin-left 24px

      @media (max-width: $small-screen)
        margin-left 12px

  .answered
    color $color-primary

    @media (max-width: $small-screen)
      .lb
        display none

  &:hover
    background $color-secondary

  &:not(.has-votes)
    .guest-info
      .votes
        opacity .3

  &.emphasize
    background lighten($color-secondary, 20%)

  &.answered
    background rgba($color-primary, .2)

</style>
