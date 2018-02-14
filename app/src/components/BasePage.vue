<template>
  <main class="page">
    <div v-if="logged && !user" class="info-block">
      Please sign in to view this content
    </div>
    <div v-else-if="admin && (!user || !user.admin)" class="info-block warning">
      You don't have access to this content
    </div>
    <slot v-else/>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    logged: {
      type: Boolean,
      default: false,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.page
  max-width $page-size
  min-height calc(100vh - 270px)
  margin auto
  padding 12px
  box-sizing border-box
</style>

<style lang="stylus">
@import "../styles/imports"

// Critical CSS

body
  margin 0
  font-family 'Roboto', sans-serif
  background darken($color-secondary, 10%)
  color $md-white

a
  text-decoration none
  color $color-primary

h1
  margin-top 0
  font-weight lighter
  font-size 2.2em
  text-align center

.material-icons
  overflow hidden
  display inline-block
  width 1em
  height 1em
</style>
