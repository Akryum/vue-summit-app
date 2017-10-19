<template>
  <div class="base-button-group">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'base-button-group',

  props: {
    value: {},
    unSelectable: {
      type: Boolean,
      default: false,
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

.base-button-group {
  display: inline-block;

  $br = 3px

  >>> .base-button {
    border-radius: 0;
    border: solid 1px $color-primary;

    &:first-child {
      border-top-left-radius: $br;
      border-bottom-left-radius: $br;
    }

    &:last-child {
      border-top-right-radius: $br;
      border-bottom-right-radius: $br;
    }

    &:not(:last-child) {
      border-right: none;
    }

    background: $md-white;
    color: $color-primary;
    float: left;
    padding: 4px 12px 3px !important;

    &.selected {
      background: $color-primary;
      color: $md-white;
    }
  }

  &:after {
    content: '';
    display: inline-block;
    height: 0;
    clear: both;
  }

  &.accent {
    >>> .base-button {
      border-color: $color-accent;
      &.selected {
        background: $color-accent;
      }
    }
  }

  &.no-border,
  &.tabs {
    >>> .base-button {
      border: none !important;
      padding: 6px 12px 5px !important;
    }
  }

  &.tabs {
    >>> .base-button {
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
      &.selected {
        color: $color-primary;
      }

      &.selected {
        border-bottom: 4px solid $color-primary !important;
      }
    }
  }

  &.fill {
    @include h-box;

    >>> .base-button {
      flex: 100% 1 1;
      padding-left: 0 !important;
      padding-right: 0 !important;
    }
  }

  &.big {
    >>> .base-button {
      padding: 16px !important;
    }

    &.tabs {
      >>> .base-button {
        padding: 18px 14px 12px !important;
      }
    }
  }

  &.block {
    display: block;
  }

  &:not(.tabs) {
    @media (max-width: $small-screen) {
      display: flex;
      flex-direction: row;

      >>> .base-button {
        font-size: 12px;
        flex: auto 1 1;
        @include ellipsis;

        &.selected {
          flex: auto 1 0;
        }
      }
    }
  }
}
</style>
