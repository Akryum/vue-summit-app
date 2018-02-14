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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import marked from 'marked'

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

    cssClass () {
      return {}
    },

    contentHtml () {
      return marked(this.answer.content)
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

  .answered
    color $color-primary

    @media (max-width: $small-screen)
      .lb
        display none

  &:hover
    background $color-secondary
</style>
