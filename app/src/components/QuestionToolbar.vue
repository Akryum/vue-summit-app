<template>
  <div class="question-toolbar">
    <BaseButtonGroup v-model="filterModel">
      <BaseButton :value="null">All</BaseButton>
      <BaseButton value="new">New</BaseButton>
      <BaseButton value="answered">Answered</BaseButton>
      <!-- <BaseButton v-if="user" value="mine">Mine</BaseButton> -->
    </BaseButtonGroup>

    <div class="more-actions">
      <BaseButtonGroup v-model="sortModel">
        <BaseButton value="">Popular</BaseButton>
        <BaseButton value="newer">Recent</BaseButton>
      </BaseButtonGroup>

      <BaseButton
        class="icon-button secondary"
        icon="refresh"
        @click="refresh"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  computed: {
    ...mapGetters('questions', [
      'filter',
      'sort',
    ]),

    // ...mapGetters('user', [
    //   'user',
    // ]),

    filterModel: {
      get () { return this.filter },
      set (value) { this.setFilter(value) },
    },

    sortModel: {
      get () { return this.sort },
      set (value) { this.setSort(value) },
    },
  },

  methods: {
    ...mapActions('questions', [
      'setFilter',
      'setSort',
    ]),

    refresh () {
      this.$emit('refresh')
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.question-toolbar
  h-box()
  align-items center
  justify-content space-between
  margin-bottom 24px

  .base-button-group
    flex auto 0 0

  .more-actions
    h-box()
    box-center()

    >>> > *
      space-between-x(6px)
</style>
