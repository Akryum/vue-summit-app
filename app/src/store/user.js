export default {
  namespaced: true,

  state () {
    return {
      user: null,
    }
  },

  getters: {
    user: state => state.user,
  },

  mutations: {
    user (state, value) {
      state.user = value
    },
  },
}
