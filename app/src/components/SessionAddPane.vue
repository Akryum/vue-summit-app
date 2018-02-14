<template>
  <BasePane
    class="session-add-pane right-pane"
    icon="event"
    title="Add a session"
    @close="close"
  >

    <div class="form">
      <div>
        <input
          v-model="title"
          placeholder="Title"
          required
          maxlength="60"
        >
      </div>

      <textarea
        v-model="description"
        class="description-input"
        placeholder="Description (markdown)"
        required
        maxlength="1000"
        rows="8"
      />

      <div class="info-block warning">
        <BaseIcon icon="warning"/>
        <div>
          When your create a Session, it will be private. After being validated by our team, it will be automatically published.
        </div>
      </div>
    </div>

    <div slot="footer" class="pane-footer">
      <BaseButton
        :disabled="!formValid"
        @click="submit"
      >
        Add the new Session
      </BaseButton>
    </div>
  </BasePane>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import SESSION_ADD_MUTATION from '../graphql/SessionAdd.gql'
import { cacheSessionAdd } from '../cache/sessions.js'

export default {
  data () {
    return {
      title: '',
      description: '',
    }
  },

  computed: {
    ...mapGetters('user', [
      'user',
    ]),

    formValid () {
      return this.title
    },
  },

  methods: {
    ...mapActions('ui', [
      'setShowAddSession',
    ]),

    close () {
      this.setShowAddSession(false)
    },

    submit () {
      if (this.formValid) {
        this.$apollo.mutate({
          mutation: SESSION_ADD_MUTATION,
          variables: {
            input: {
              title: this.title,
              description: this.description,
            },
          },
          // Update the cache
          update: (store, { data: { sessionAdd } }) => {
            cacheSessionAdd(store, sessionAdd)
          },
          optimisticResponse: {
            __typename: 'Mutation',
            sessionAdd: {
              __typename: 'Session',
              id: '',
              title: this.title,
              description: this.description,
              public: false,
              date: Date.now(),
              user: this.user,
              questionCount: 0,
            },
          },
        })

        this.close()
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@import "../styles/imports"

.description-input
  margin 32px 0

.pane-footer
  h-box()
  box-center()

</style>
