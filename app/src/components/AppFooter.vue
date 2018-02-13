<template>
  <footer class="app-footer">
    <div>Made with <a href="https://vuejs.org/">Vue</a> + <a href="https://apollodata.com/">Apollo</a> + ❤️</div>

    <div>
      <a
        class="github-button"
        href="https://github.com/Akryum/vue-summit-app"
        data-icon="octicon-star"
        data-size="large"
        data-show-count="true"
        aria-label="Star Akryum/vue-summit-app on GitHub"
      >Star</a>
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
