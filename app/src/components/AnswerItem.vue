<template>
  <div class="answer-item" :class="cssClass">

    <!-- Author Avatar -->
    <div class="avatar">
      <img
        v-if="answer.user.avatar"
        class="img"
        :src="answer.user.avatar"
      >
    </div>

    <!-- Question content -->
    <div class="content">
      <div class="text" v-html="contentHtml"/>

      <div class="info">
        <span class="author">{{ answer.user.name }}</span>
        <span class="date">
          <BaseIcon icon="schedule"/>
          <BaseTimeAgo :date="answer.date"/>
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="user" class="actions">
      <template v-if="answer.user.id === user.id || user.admin">
        <BaseButton
          icon="done"
          class="icon-button secondary"
          :class="{
            selected: answer.answered,
          }"
          @click.prevent="toggleAnswered"
        />
      </template>

      <div v-else-if="answer.answered" class="answered">
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
        @click.prevent="setShowAnswer(answer.id)"
      >
        {{ answer.answerCount }}
      </BaseButton>

      <BaseButton
        icon="thumb_up"
        class="secondary"
        :class="{
          selected: answer.hasVoted,
        }"
        @click.prevent="toggleVoted"
      >
        {{ answer.votes }}
      </BaseButton>
    </div>

    <div v-else class="guest-info">
      <div v-if="answer.answered" class="answered">
        <BaseIcon icon="done"/> <span class="lb">Answered</span>
      </div>

      <div class="votes">
        <BaseIcon icon="thumb_up"/> {{ answer.votes }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { cacheQuestionRemove } from '../cache/answers'
import marked from 'marked'

import QUESTION_TOGGLE_VOTED from '../graphql/QuestionToggleVoted.gql'
import QUESTION_TOGGLE_ANSWERED from '../graphql/QuestionToggleAnswered.gql'
import QUESTION_REMOVE from '../graphql/QuestionRemove.gql'

export default {
  props: {
    answer: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),

    ...mapGetters('answers', [
      'requestFilter',
      'requestSort',
    ]),

    cssClass () {
      return {
        answered: this.answer.answered,
        'has-voted': this.answer.hasVoted,
      }
    },

    contentHtml () {
      return marked(this.answer.content)
    },
  },

  methods: {
    toggleAnswered () {
      this.$apollo.mutate({
        mutation: QUESTION_TOGGLE_ANSWERED,
        variables: {
          id: this.answer.id,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          answerToggleAnswered: {
            __typename: 'Question',
            id: this.answer.id,
            answered: !this.answer.answered,
          },
        },
      })
    },

    toggleVoted () {
      const newVotes = this.answer.hasVoted
        ? this.answer.votes - 1
        : this.answer.votes + 1
      const newHasVoted = !this.answer.hasVoted

      this.$apollo.mutate({
        mutation: QUESTION_TOGGLE_VOTED,
        variables: {
          id: this.answer.id,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          answerToggleVoted: {
            __typename: 'Question',
            id: this.answer.id,
            votes: newVotes,
            hasVoted: newHasVoted,
          },
        },
      })
    },

    removeQuestion () {
      this.$apollo.mutate({
        mutation: QUESTION_REMOVE,
        variables: {
          id: this.answer.id,
        },
        // Update the cache
        update: (store, { data: { answerRemove } }) => {
          cacheQuestionRemove(store, {
            filter: this.requestFilter,
            sort: this.requestSort,
          }, answerRemove)
        },
        optimisticResponse: {
          __typename: 'Mutation',
          answerRemove: {
            __typename: 'Question',
            id: this.answer.id,
          },
        },
      })
    },

    setShowAnswer () {

    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.answer-item
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

  &.answered
    background rgba($color-primary, .2)
</style>
