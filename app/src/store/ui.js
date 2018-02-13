export default {
  namespaced: true,

  state () {
    return {
      showAddQuestion: false,
      showAddSession: false,
    }
  },

  getters: {
    showAddQuestion: state => state.showAddQuestion,
    showAddSession: state => state.showAddSession,
  },

  mutations: {
    showAddQuestion (state, value) {
      state.showAddQuestion = value
    },

    showAddSession (state, value) {
      state.showAddSession = value
    },
  },

  actions: {
    setShowAddQuestion ({ commit }, value) {
      commit('showAddQuestion', value)
    },

    setShowAddSession ({ commit }, value) {
      commit('showAddSession', value)
    },
  },
}
