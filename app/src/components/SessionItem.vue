<template>
  <router-link
    class="session-item"
    :class="cssClass"
    tag="div"
    :to="{ name: 'session', params: { sessionId: session.id } }"
  >
    <!-- Author Avatar -->
    <div class="avatar">
      <img
        v-if="session.user.avatar"
        class="img"
        :src="session.user.avatar"
      >
    </div>

    <!-- Question content -->
    <div class="content">
      <div class="header">
        <span class="title">{{ session.title }}</span>

        <span v-if="!session.public" class="tag private">private</span>
      </div>

      <div class="info">
        <span class="author">by {{ session.user.name }}</span>
        <span class="date">
          <BaseIcon icon="schedule"/>
          <BaseTimeAgo :date="session.date"/>
        </span>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    session: {
      type: Object,
      required: true,
    },
  },

  computed: {
    cssClass () {
      return {
        private: !this.session.public,
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.session-item
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

  .header
    h-box()
    align-items center

  .tag
    &.private
      background $md-purple
      color $md-white

  .actions
    h-box()
    box-center()

  &:hover
    background $md-grey-100

  &.private
    opacity .6
</style>
