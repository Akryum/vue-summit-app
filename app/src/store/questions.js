export default {
  namespaced: true,

  state () {
    return {
      session: {
        id: null,
      },
      filter: 'new',
      sort: '',
      searchText: '',
    }
  },

  getters: {
    sessionId: state => state.session.id,
    session: state => state.session,
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
    sessionId (state, value) {
      state.session.id = value
    },
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
    setSessionId ({ commit }, value) {
      commit('sessionId', value)
    },
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
