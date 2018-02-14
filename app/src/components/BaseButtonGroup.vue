<template>
  <div class="base-button-group">
    <slot/>
  </div>
</template>

<script>
export default {
  name: 'BaseButtonGroup',

  provide () {
    return {
      buttonGroupChildData: this.childData,
      buttonGroupOnChange: this.handleValueChange,
    }
  },

  props: {
    // eslint-disable-next-line vue/require-prop-types
    value: {
      default: null,
    },
    unSelectable: {
      type: Boolean,
      default: false,
    },
  },

  data () {
    return {
      childData: {
        value: this.value,
      },
    }
  },

  watch: {
    value (value) {
      this.childData.value = value
    },
  },

  methods: {
    handleValueChange (value) {
      this.$emit('input', this.unSelectable && this.value === value ? '' : value)
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.base-button-group
  display: inline-block;

  $br = 3px

  >>> .base-button
    border-radius: 0;
    background lighten($color-secondary, 20%)
    color lighten($color-primary, 30%)
    border-color @background
    float: left;
    padding: 4px 12px 3px !important;

    &:first-child
      border-top-left-radius: $br;
      border-bottom-left-radius: $br;

    &:last-child
      border-top-right-radius: $br;
      border-bottom-right-radius: $br;

    &:not(:last-child)
      border-right: none;

    &.selected
      background: $color-primary;
      color: $md-white;
      border-color @background

    &:hover:not(.selected)
      background rgba($color-primary, .3)
      border-color $color-primary
      border-right solid 1px

      & + .base-button
        border-left none

  &:after
    content: '';
    display: inline-block;
    height: 0;
    clear: both;

  &.accent
    >>> .base-button
      border-color: $color-accent;
      &.selected
        background: $color-accent;

  &.no-border,
  &.tabs
    >>> .base-button
      border: none !important;
      padding: 6px 12px 5px !important;

  &.tabs
    >>> .base-button
      display: inline-block;
      color: $md-grey-400;
      padding: 10px 14px !important;
      border-bottom: 4px solid transparent !important;
      text-transform: uppercase;
      cursor: pointer;
      font-size: 12px;
      background: none;
      box-shadow: none;
      border-radius: 0;
      outline: none;

      &:hover,
      &.selected
        color: $color-primary;

      &.selected
        border-bottom: 4px solid $color-primary !important;

  &.fill
    @include h-box;

    >>> .base-button
      flex: 100% 1 1;
      padding-left: 0 !important;
      padding-right: 0 !important;

  &.big
    >>> .base-button
      padding: 16px !important;

    &.tabs
      >>> .base-button
        padding: 18px 14px 12px !important;

  &.block
    display: block;

  &:not(.tabs)
    @media (max-width: $small-screen)
      display: flex;
      flex-direction: row;

      >>> .base-button
        font-size: 12px;
        flex: auto 1 1;
        @include ellipsis;

        &.selected
          flex: auto 1 0;

</style>
