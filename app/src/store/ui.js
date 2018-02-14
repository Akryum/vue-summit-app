export default {
  namespaced: true,

  state () {
    return {
      showQuestionPane: false,
      showSessionPane: false,
      showAnswerPane: false,
    }
  },

  getters: {
    showQuestionPane: state => state.showQuestionPane,
    showSessionPane: state => state.showSessionPane,
    showAnswerPane: state => state.showAnswerPane,
  },

  mutations: {
    showQuestionPane (state, value) {
      state.showQuestionPane = value
    },

    showSessionPane (state, value) {
      state.showSessionPane = value
    },

    showAnswerPane (state, value) {
      state.showAnswerPane = value
    },
  },

  actions: {
    setShowAddQuestion ({ commit }, value) {
      commit('showQuestionPane', value)
    },

    setShowAddSession ({ commit }, value) {
      commit('showSessionPane', value)
    },

    setShowAnswerPane ({ commit }, value) {
      commit('showAnswerPane', value)
    },
  },
}
