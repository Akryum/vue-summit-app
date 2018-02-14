<template>
  <BasePane
    class="answers-pane right-pane"
    icon="comment"
    title="Answers"
    @close="close"
  >

    Helloworld

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

.pane-footer
  h-box()
  box-center()

  .comment-input
    flex auto 1 1

</style>
