export default {
  namespaced: true,

  state () {
    return {
      showAddQuestion: false,
    }
  },

  getters: {
    showAddQuestion: state => state.showAddQuestion,
  },

  mutations: {
    showAddQuestion (state, value) {
      state.showAddQuestion = value
    },
  },

  actions: {
    setShowAddQuestion ({ commit }, value) {
      commit('showAddQuestion', value)
    },
  },
}
