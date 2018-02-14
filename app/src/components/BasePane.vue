<template>
  <div class="base-pane">
    <div class="background" @click="close"/>
    <div class="pane">
      <div class="header">
        <div v-if="title" class="title">
          <i
            v-if="icon"
            class="icon material-icons"
            v-text="icon"
          />
          {{ title }}
        </div>
        <BaseButton
          class="icon-button secondary"
          icon="close"
          @click="close"
        />
      </div>
      <div class="content">
        <slot/>
      </div>
      <div class="footer">
        <slot name="footer"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },

  methods: {
    close () {
      this.$emit('close')
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-pane
  .background,
  .pane
    position fixed
    top 0
    bottom 0

  .background
    left 0
    right 0
    background rgba($md-black, .7)

  .pane
    width 30vw
    max-width 800px
    min-width 500px
    background $color-secondary
    v-box()

    @media (max-width: $small-screen)
      min-width 0
      width 100vw

  .header
    padding 32px
    h-box()
    box-center()

    .title
      flex 1
      font-size 24px
      font-weight lighter
      margin-left 6px

      .icon
        color $color-primary
        margin-right 2px

  .content
    flex 1
    overflow-x hidden
    overflow-y auto

  &.right-pane
    .pane
      right 0

  &.left-pane
    .pane
      left 0

  .header,
  .footer,
  >>> .form
    padding 32px

</style>
