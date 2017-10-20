<template>
  <div class="question-toolbar">
    <div
      v-if="showSearch"
      class="state search"
    >
      <div class="actions">
        <BaseButton
          icon="close"
          class="icon-button secondary"
          @click="closeSearch"
        />
      </div>

      <input
        ref="searchInput"
        v-model="searchTextModel"
        class="search-input input"
        placeholder="Search"
        @keyup.esc="closeSearch"
      />
    </div>
    <div
      v-else
      class="state default"
    >
      <div class="actions">
        <BaseButton
          icon="search"
          class="icon-button secondary"
          @click="openSearch"
        />

        <BaseButtonGroup v-model="filterModel">
          <BaseButton :value="null">All</BaseButton>
          <BaseButton value="new">New</BaseButton>
          <BaseButton value="answered">Answered</BaseButton>
          <!-- <BaseButton v-if="user" value="mine">Mine</BaseButton> -->
        </BaseButtonGroup>
      </div>

      <div class="actions">
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
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import throttle from 'lodash.throttle'

export default {
  data () {
    return {
      showSearch: false,
    }
  },

  computed: {
    ...mapGetters('questions', [
      'filter',
      'sort',
      'searchText',
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

    searchTextModel: {
      get () { return this.searchText },
      set: throttle(function (value) { this.setSearchText(value) }, 500),
    },
  },

  methods: {
    ...mapActions('questions', [
      'setFilter',
      'setSort',
      'setSearchText',
    ]),

    refresh () {
      this.$emit('refresh')
    },

    openSearch () {
      this.showSearch = true
      // Focus search input
      this.$nextTick(() => {
        this.$refs.searchInput.focus()
      })
    },

    closeSearch () {
      this.showSearch = false
      this.searchTextModel = ''
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.question-toolbar
  .state
    h-box()
    align-items center
    justify-content space-between

  .actions
    h-box()
    box-center()
    space-between-x(6px)

    >>> > *
      space-between-x(6px)

  .search-input
    flex auto 1 1
    width 0
</style>
