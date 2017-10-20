<template>
  <div id="app" class="page page-server-error">
    <div class="header">
      <img class="logo" src="public/logo-simple.svg" />
      <h1>Summit</h1>
    </div>

    <div class="content">
      <h2>A server error occured</h2>
      <div>
        <BaseButton
          icon="refresh"
          onclick="location.reload()"
        >
          Retry
        </BaseButton>
      </div>

      <div class="details">
        Error Code: {{ error.code }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="stylus">
@require "../styles/base"
</style>

<style lang="stylus" scoped>
@import "../styles/imports"

.page
  text-align center

.header
  padding 42px
  margin-bottom 42px
  background lighten($color-primary, 90%)

.logo
  max-height 30vh

.details
  margin 42px
  color $md-grey
</style>
