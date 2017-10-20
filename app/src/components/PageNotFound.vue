<template>
  <BasePage class="page-not-found">
    <h1>This page can't be found</h1>
    <p>
      Sorry, but we can't find the page you're looking for.<br>
      It might have been moved or deleted.<br>
      Check your spelling or click below to return to the homepage.
    </p>
    <div class="actions">
      <router-link :to="{ name: 'home' }">Return to home</router-link>
    </div>
  </BasePage>
</template>

<script>
export default {
  name: 'not-found-page',
}
</script>

<style lang="stylus" scoped>
p
  text-align: center

.page-not-found
  padding-top 100px
</style>
