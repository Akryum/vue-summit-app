<template>
  <BasePage class="page-about">
    <h1>About Summit</h1>

    <p>Summit allows speakers and other conference/lecture hosts to gather questions from their audience. The questions are sorted by votes by default so the most popular ones will go up.</p>

    <h2>Tech</h2>

    <p>Summit is based on <a href="https://vuejs.org/" target="_blank">Vue.js</a> for the frontend, <a href="https://apollographql.com/" target="_blank">Apollo</a> and <a href="https://graphql.org" target="_blank">GraphQL</a> for the web service and <a href="https://www.mongodb.com/" target="_blank">MongoDB</a> as the database.</p>

    <h2>Open Source</h2>

    <p>Summit is an Open Source project! Visit the <a href="https://github.com/Akryum/vue-summit-app" target="_blank">GitHub repository</a> or <a href="https://github.com/Akryum/vue-summit-app/issues" target="_blank">Report a bug</a>.</p>

    <div class="programmer">
      <img
        class="image"
        src="/public/programmer-male.svg"
        alt="programmer"
      >
    </div>
  </BasePage>
</template>

<style lang="stylus" scoped>
@import "../styles/imports"

.programmer
  text-align center

  .image
    max-width 500px

</style>
