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

    <!-- Answer content -->
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
    <div v-if="user && !hideActions" class="actions">
      <template v-if="user.id === question.user.id || user.admin">
        <BaseButton
          icon="done"
          class="icon-button secondary"
          :class="{ selected: isPicked }"
          @click.stop="pickAnswer"
        />
      </template>
      <div
        v-else-if="isPicked"
        class="picked"
        title="This answer has been picked!"
      >
        <BaseIcon icon="done"/>
      </div>
      <template v-if="user.admin">
        <BaseButton
          icon="delete"
          class="icon-button secondary"
          @click.stop="removeAnswer"
        />
      </template>
    </div>

    <div v-else class="guest-info">
      <div
        v-if="isPicked"
        class="picked"
        title="This answer has been picked!"
      >
        <BaseIcon icon="done"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import marked from 'marked'
import { cacheAnswerRemove } from '../cache/answers'

import ANSWER_REMOVE_MUTATION from '../graphql/AnswerRemove.gql'
import QUESTION_SET_PICKED_ANSWER_MUTATION from '../graphql/QuestionSetPickedAnswer.gql'

export default {
  props: {
    answer: {
      type: Object,
      required: true,
    },

    question: {
      type: Object,
      required: true,
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

    cssClass () {
      return {}
    },

    contentHtml () {
      return marked(this.answer.content)
    },

    isPicked () {
      return this.question.pickedAnswer && this.question.pickedAnswer.id === this.answer.id
    },
  },

  methods: {
    removeAnswer () {
      if (!confirm('Delete this answer?')) return

      this.$apollo.mutate({
        mutation: ANSWER_REMOVE_MUTATION,
        variables: {
          questionId: this.question.id,
          id: this.answer.id,
        },
        update: (store, { data: { answerRemove } }) => {
          cacheAnswerRemove(store, {
            questionId: this.question.id,
          }, answerRemove)
        },
        optimisticResponse: {
          __typename: 'Mutation',
          answerRemove: {
            __typename: 'Answer',
            ...this.answer,
          },
        },
      })
    },

    pickAnswer () {
      let newValue
      if (this.isPicked) {
        newValue = null
      } else {
        newValue = this.answer.id
      }

      this.$apollo.mutate({
        mutation: QUESTION_SET_PICKED_ANSWER_MUTATION,
        variables: {
          id: this.question.id,
          answerId: newValue,
        },
      })
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

    .text
      white-space pre-pre-wrap
      margin-bottom 6px

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

  .picked
    color $color-primary
    font-size 24px
    h-box()
    box-center()

  &:hover
    background lighten($color-secondary, 5%)

  &.showcase
    background lighten($color-secondary, 5%)
</style>
