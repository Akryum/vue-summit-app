<template>
  <button
    class="base-button"
    :class="cssClass"
    :disabled="disabled"
    @click="onClick"
  >
    <BaseIcon
      v-if="icon"
      :icon="icon"
    />

    <span class="content">
      <slot/>
    </span>

    <div
      v-if="badge !== null"
      class="button-badge"
    >
      <span>{{ badge }}</span>
    </div>
  </button>
</template>

<script>
export default {
  inject: {
    buttonGroupChildData: { default: undefined },
    buttonGroupOnChange: { default: undefined },
  },

  props: {
    icon: {
      type: String,
      default: null,
    },
    badge: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {},
  },

  computed: {
    cssClass () {
      return {
        selected: this.selected,
      }
    },

    selected () {
      return this.buttonGroupChildData && this.buttonGroupChildData.value === this.value
    },
  },

  methods: {
    onClick (e) {
      this.$emit('click', e)

      if (typeof this.buttonGroupOnChange === 'function') {
        this.buttonGroupOnChange(this.value)
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-button
  height 39px
  border-radius 3px
  background $color-primary
  border solid 1px $color-primary
  color white
  cursor pointer
  display inline-block
  text-align center
  transition background .3s
  user-select none
  -webkit-tap-highlight-color rgba(255, 255, 255, 0)
  position relative

  .button-badge
    pointer-events none
    position absolute
    top -4px
    right @top
    width 22px
    height @width
    font-size 14px
    border-radius 50%
    font-weight bold
    h-box()
    box-center()
    letter-spacing -2px
    padding-right: -@letter-spacing
    box-sizing border-box

  .icon
    font-size 1.2em
    margin-right 2px

  &:active
    background darken($color-primary, 10%)
    border-color @background

  &.fab
    position fixed
    z-index 1
    bottom 24px
    right 18px
    font-size 24px
    width 56px
    height 56px
    border-radius 50%
    padding 0
    display flex
    align-items center
    justify-content center
    box-shadow 0 4px 10px rgba(black, .3)

  &.icon-button
    width 40px
    padding 8px
    flex auto 0 0

    .icon
      position relative
      top -2px
      font-size 24px

  &.secondary
    background white
    color $color-primary

    &:hover
      background lighten($color-primary, 85%)

  &,
  &.selected
    background $color-primary
    color $md-white

    &:hover
      background lighten($color-primary, 10%)
      border-color @background

  &.accent
    color white
    background $color-accent
    border-color @background

    &:hover
      background lighten($color-accent, 10%)

  &[disabled='disabled']
    background $md-grey-400
    cursor not-allowed
    color $md-grey-200
    border-color $md-grey-500

</style>
