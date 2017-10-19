<template>
  <BasePane
    class="question-add-pane right-pane"
    icon="question_answer"
    title="Post a Question"
    @close="close"
  >

    <div class="form">
      <div>
        <input
          v-model="title"
          placeholder="Title"
          required
          maxlength="60"
        />
      </div>

      <textarea
       v-model="content"
       class="content-input"
       placeholder="Content"
       required
       maxlength="500"
       rows="8"
      ></textarea>
    </div>

    <div slot="footer" class="pane-footer">
      <BaseButton
        :disabled="!formValid"
        @click="submit"
      >
        Post the new Question
      </BaseButton>
    </div>
  </BasePane>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import QUESTION_ADD_MUTATION from '../graphql/QuestionAdd.gql'
import { cacheQuestionAdd } from '../cache/questions.js'

export default {
  data () {
    return {
      title: '',
      content: '',
    }
  },

  computed: {
    ...mapGetters('questions', [
      'requestFilter',
      'requestSort',
    ]),

    ...mapGetters('user', [
      'user',
    ]),

    formValid () {
      return this.title && this.content
    },
  },

  methods: {
    ...mapActions('ui', [
      'setShowAddQuestion',
    ]),

    close () {
      this.setShowAddQuestion(false)
    },

    submit () {
      if (this.formValid) {
        this.$apollo.mutate({
          mutation: QUESTION_ADD_MUTATION,
          variables: {
            input: {
              title: this.title,
              content: this.content,
            },
          },
          // Update the cache
          update: (store, { data: { questionAdd } }) => {
            cacheQuestionAdd(store, {
              filter: this.requestFilter,
              sort: this.requestSort,
            }, questionAdd)
          },
          optimisticResponse: {
            __typename: 'Mutation',
            questionAdd: {
              __typename: 'Question',
              id: '',
              title: this.title,
              content: this.content,
              votes: 0,
              hasVoted: false,
              answered: false,
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

.form,
.pane-footer
  padding 12px

.content-input
  margin-top 12px

.pane-footer
  h-box()
  box-center()

</style>
