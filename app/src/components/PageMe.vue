<template>
  <BasePage class="page-me" logged>
    <h2>My Profile</h2>

    <div class="profile">
      <div class="avatar">
        <img
          v-if="user.avatar"
          class="img"
          :src="user.avatar"
        >
      </div>
      <div class="name">{{ user.name }}</div>
      <div v-if="user.admin" class="admin">Admin</div>
    </div>

    <div class="actions profile-actions">
      <BaseButton
        icon="power_settings_new"
        @click="logout"
      >
        Logout
      </BaseButton>
    </div>

    <h2>My sessions</h2>

    <div class="info-block">
      <BaseIcon icon="info"/>
      <div>
        Sessions are pages where people can post questions.
      </div>
    </div>

    <div class="info-block warning">
      <BaseIcon icon="warning"/>
      <div>
        When your create a Session, it will be private. After being validated by our team, it will be automatically published.
      </div>
    </div>

    <div class="actions">
      <BaseButton
        icon="add"
        @click="setShowAddSession(true)"
      >
        Create a Session
      </BaseButton>
    </div>

    <SessionList
      :query="require('../graphql/SessionsUser.gql')"
      data-prop="sessionsUser"
    />
  </BasePage>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { ENDPOINT } from '../config'

import SessionList from './SessionList.vue'

export default {
  components: {
    SessionList,
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),
  },

  methods: {
    ...mapActions('ui', [
      'setShowAddSession',
    ]),

    logout () {
      document.location.href = `${ENDPOINT}/logout`
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.profile
  v-box()
  box-center()
  background $color-secondary
  color $md-white
  padding 32px
  margin 12px 0 0
  border-radius 3px 3px 0 0

  >>> > *
    space-between-y(8px)

  .avatar
    width 64px
    height @width

  .name
    font-size 20px

.actions
  h-box()
  box-center()
  padding 12px
  background darken($color-secondary, 20%)
  margin 12px 0
  border-radius 3px

  &.profile-actions
    margin-top 0
    border-radius 0 0 3px 3px
</style>
