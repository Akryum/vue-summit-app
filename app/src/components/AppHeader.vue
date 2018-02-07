<template>
  <header class="app-header">
    <div v-if="!user" class="content guest">
      <h1 class="app-name">
        <router-link class="link" :to="{ name: 'home' }">
          <img class="img" src="public/logo-simple.svg">
          <span>Summit</span>
        </router-link>
      </h1>

      <div class="catch-phrase">Get answers.</div>

      <div class="login">
        <BaseButton
          icon="account_circle"
          @click="openAuthWindow"
        >
          Sign in with Google
        </BaseButton>
      </div>
    </div>

    <div v-else class="content signed">
      <h1 class="app-name">
        <router-link class="link" :to="{ name: 'home' }">
          <img class="img" src="public/logo-simple.svg">
          <span>Summit</span>
        </router-link>
      </h1>

      <div class="user">
        <div class="avatar">
          <img
            v-if="user.avatar"
            class="img"
            :src="user.avatar"
          >
        </div>
        <div class="user-name">{{ user.name }}</div>
        <BaseButton
          icon="add"
          class="accent"
          @click="setShowAddQuestion(true)"
        >
          Post a Question
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { ENDPOINT } from '../config'
import USER_QUERY from '../graphql/CurrentUser.gql'

export default {
  computed: {
    ...mapGetters('user', [
      'user',
    ]),
  },

  beforeDestroy () {
    window.removeEventListener('message', this.handleMessage)
  },

  methods: {
    ...mapMutations('user', {
      setUser: 'user',
    }),

    ...mapActions('ui', [
      'setShowAddQuestion',
    ]),

    openAuthWindow () {
      if (!this.messageListener) {
        window.addEventListener('message', this.handleMessage)
        this.messageListener = true
      }

      const url = `${ENDPOINT}/auth/google`
      const name = 'google_login'
      const specs = 'width=500,height=500'
      window.open(url, name, specs)
    },

    handleMessage ({data, origin}) {
      if (origin !== ENDPOINT) {
        return
      }
      if (data === 'success') {
        this.login()
      }
    },

    async login () {
      const result = await this.$apollo.query({
        query: USER_QUERY,
        fetchPolicy: 'network-only',
      })
      this.setUser(result.data.currentUser)
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.app-header
  text-align center
  margin-bottom 24px

  .content
    background lighten($color-primary, 90%)

  .app-name
    flex 1
    margin 0
    text-align left

    @media (max-width: $small-screen)
      font-size 1.2em

    .link
      box-center()

  .catch-phrase
    color lighten($color-primary, 20%)
    margin-bottom 32px

  .guest
    padding 42px 0

    .app-name
      margin-bottom 6px
      font-size 2.5em

      .link
        v-box()

        .img
          width 244px
          height @width
          margin-bottom 12px

  .signed
    h-box()
    box-center()
    padding 12px

    .app-name
      flex 1

      .link
        h-box()
        justify-content flex-start

        .img
          width 48px
          height @width
          margin 0 12px

    .user
      h-box()
      box-center()
      color rgba($md-black, .5)
      margin 0 12px

      .avatar
        width 32px
        height @width
        margin-right 12px

      .user-name
        font-size 12px
        margin-right 24px

      .avatar,
      .user-name
        @media (max-width: $small-screen)
          display none
</style>
