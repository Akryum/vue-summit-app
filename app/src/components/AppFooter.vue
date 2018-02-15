<template>
  <footer class="app-footer">
    <div>Made with <a href="https://vuejs.org/">Vue</a> + <a href="https://apollodata.com/">Apollo</a> + <router-link :to="{ name: 'about' }">❤️</router-link></div>

    <div>
      <a href="https://github.com/Akryum/vue-summit-app">Sources</a>
    </div>
  </footer>
</template>

<style lang="stylus" scoped>
@import "../styles/imports"

.app-footer
  text-align center
  padding 42px
  color $md-grey-300

  >>> > *
    space-between-y(12px)
</style>
