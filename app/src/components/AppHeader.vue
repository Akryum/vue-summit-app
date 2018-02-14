<template>
  <header class="app-header" v-sticky="user && { zIndex: 1000, marginTop: 0 }">
    <div v-if="!user" class="content guest">
      <h1 class="app-name">
        <router-link class="link" :to="{ name: 'home' }">
          <img class="img" src="/public/logo-simple.svg">
          <span>Summit</span>
        </router-link>
      </h1>

      <div class="catch-phrase">Ask the host. Get answers.<br><router-link :to="{ name: 'about' }">More info</router-link></div>

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
          <img class="img" src="/public/logo-simple.svg">
          <span>Summit</span>
        </router-link>
      </h1>

      <div class="user">
        <router-link class="me-link" :to="{ name: 'me' }">
          <div class="avatar">
            <img
              v-if="user.avatar"
              class="img"
              :src="user.avatar"
            >
          </div>
          <div class="user-name">{{ user.name }}</div>
        </router-link>

        <router-link v-if="user.admin" :to="{ name: 'admin' }">
          <BaseIcon icon="https"/> Admin
        </router-link>

        <BaseButton
          v-if="$route.name === 'session'"
          icon="add"
          class="accent post-question"
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
      const url = `${ENDPOINT}/auth/google`
      document.location = url
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.app-header
  text-align center
  margin-bottom 24px
  color $md-white

  .content
    background $color-secondary
    box-shadow 0 0 10px rgba(black, 0.2)

  .app-name
    flex 1
    margin 0
    text-align left

    @media (max-width: $small-screen)
      font-size 1.2em

    .link
      box-center()

  .catch-phrase
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
      margin 0 12px

      .me-link
        h-box()
        box-center()

      .avatar
        width 32px
        height @width
        margin-right 12px

      .user-name
        font-size 12px
        margin-right 24px
        color @color

      .avatar,
      .user-name
        @media (max-width: $small-screen)
          display none

      .post-question
        margin-left 12px
</style>
