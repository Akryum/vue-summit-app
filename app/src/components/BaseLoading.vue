<template>
  <div class="base-loading">
    <div class="wrapper">
      <div class="spinner"/>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-loading
  flex-box()
  box-center()

  .wrapper
    display inline-block

  .spinner
    width 24px
    height @width
    border-radius 50%
    border solid 3px transparent
    border-right-color $color-primary
    animation spinner .7s linear infinite

  &.overlay
    position absolute
    top 0
    bottom 0
    left 0
    right 0

  &.raised
    .wrapper
      background $md-white
      padding 12px
      border-radius 50%
      box-shadow 0 5px 30px rgba(black, .1)

  &.delay
    &.fade-enter-active
      transition-delay .5s

@keyframes spinner
  0%
    transform rotate(0deg)
  100%
    transform rotate(360deg)
</style>
