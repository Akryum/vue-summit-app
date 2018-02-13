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

      <div class="text">{{ question.content }}</div>

      <div class="info">
        <span class="author">by {{ question.user.name }}</span>
        <span class="date">
          <BaseIcon icon="schedule"/>
          <BaseTimeAgo :date="question.date"/>
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="user" class="actions">
      <template v-if="question.user.id === user.id || user.admin">
        <BaseButton
          icon="done"
          class="icon-button secondary"
          :class="{
            selected: question.answered,
          }"
          @click="toggleAnswered"
        />
      </template>

      <div v-else-if="question.answered" class="answered">
        <BaseIcon icon="done"/> <span class="lb">Answered</span>
      </div>

      <template v-if="user.admin">
        <BaseButton
          icon="delete"
          class="icon-button secondary"
          @click="removeQuestion"
        />
      </template>

      <BaseButton
        icon="thumb_up"
        class="secondary"
        :class="{
          selected: question.hasVoted,
        }"
        @click="toggleVoted"
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
import { mapGetters } from 'vuex'
import { cacheQuestionRemove } from '../cache/questions'

import QUESTION_TOGGLE_VOTED from '../graphql/QuestionToggleVoted.gql'
import QUESTION_TOGGLE_ANSWERED from '../graphql/QuestionToggleAnswered.gql'
import QUESTION_REMOVE from '../graphql/QuestionRemove.gql'

export default {
  props: {
    question: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),

    ...mapGetters('questions', [
      'requestFilter',
      'requestSort',
    ]),

    cssClass () {
      return {
        answered: this.question.answered,
        'has-voted': this.question.hasVoted,
      }
    },
  },

  methods: {
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
      this.$apollo.mutate({
        mutation: QUESTION_REMOVE,
        variables: {
          id: this.question.id,
        },
        // Update the cache
        update: (store, { data: { questionRemove } }) => {
          cacheQuestionRemove(store, {
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
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.question-item
  padding 24px 32px
  h-box()
  align-items stretch

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
    color rgba($md-black, .5)
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
    color rgba($md-black, .5)

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
    background $md-grey-100

  &.answered
    background lighten($color-primary, 90%)
</style>
