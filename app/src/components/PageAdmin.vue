<template>
  <BasePage
    class="page-admin"
    logged
    admin
  >
    <h2>All Sessions</h2>

    <SessionList
      :query="require('../graphql/SessionsAll.gql')"
      data-prop="sessionsAll"
    />
  </BasePage>
</template>

<script>
import SessionList from './SessionList.vue'

export default {
  components: {
    SessionList,
  },
}
</script>
