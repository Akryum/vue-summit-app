export default {
  namespaced: true,

  state () {
    return {
      filter: 'new',
      sort: '',
      searchText: '',
    }
  },

  getters: {
    filter: state => state.filter,
    requestFilter: state => {
      let filter = {}

      if (state.searchText) {
        filter.text = state.searchText
      } else {
        switch (state.filter) {
          case 'new':
            filter.answered = false
            break
          case 'answered':
            filter.answered = true
            break
          // case 'mine':
          //   filter.mine = true
          //   break
        }
      }

      return filter
    },
    requestSort: state => {
      if (state.searchText) {
        return 'text'
      } else {
        return state.sort
      }
    },
    sort: state => state.sort,
    searchText: state => state.searchText,
  },

  mutations: {
    filter (state, value) {
      state.filter = value
    },
    sort (state, value) {
      state.sort = value
    },
    searchText (state, value) {
      state.searchText = value
    },
  },

  actions: {
    setFilter ({ commit }, value) {
      commit('filter', value)
    },
    setSort ({ commit }, value) {
      commit('sort', value)
    },
    setSearchText ({ commit }, value) {
      commit('searchText', value)
    },
  },
}
