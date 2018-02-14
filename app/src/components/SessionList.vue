<template>
  <ApolloQuery
    class="session-list"
    :query="query"
    fetch-policy="cache-and-network"
  >
    <template slot-scope="{ result: { data, loading, error } }">
      <BaseLoading v-if="loading"/>

      <div v-else-if="error" class="info-block danger">
        <BaseIcon icon="error"/>
        <div>An error occured while fetching the sessions.</div>
      </div>

      <template v-if="data && data[dataProp].length">
        <SessionItem
          v-for="session of data[dataProp]"
          :key="session.id"
          :session="session"
          class="item"
        />
      </template>

      <div v-else-if="!loading" class="empty">No Sessions yet</div>
    </template>
  </ApolloQuery>
</template>

<script>
import SessionItem from './SessionItem.vue'

export default {
  components: {
    SessionItem,
  },

  props: {
    query: {
      type: Object,
      required: true,
    },

    dataProp: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.item
  margin-bottom 12px

.base-loading
  height 0
</style>
