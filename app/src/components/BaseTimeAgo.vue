<template>
  <span :title="title">{{ date | fromNow }}</span>
</template>

<script>
import { date } from '../filters'

export default {
  props: {
    date: {
      type: [Number, String, Date],
      required: true,
    },
  },

  computed: {
    title () {
      return date(this.date, 'LLL')
    },
  },

  mounted () {
    this.$_timer = setInterval(() => {
      this.$forceUpdate()
    }, 60 * 1000)
  },

  beforeDestroy () {
    clearInterval(this.$_timer)
  },
}
</script>
