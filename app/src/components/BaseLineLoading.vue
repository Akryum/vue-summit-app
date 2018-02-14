<template>
  <transition name="fade-out">
    <div class="base-line-loading">
      <div class="bar"/>
    </div>
  </transition>
</template>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-line-loading
  height 0
  position relative
  z-index 300

.bar
  height 3px
  background $color-primary
  position absolute
  top 0
  animation bar-animation .8s infinite linear

@keyframes bar-animation
  0%
    left 0
    right 100%
  50%
    left 0
    right 0
  100%
    left 100%
    right 0

</style>
