<template>
  <span>{{ date | fromNow }}</span>
</template>

<script>
export default {
  props: {
    date: {
      type: [Number, String, Date],
      required: true,
    },
  },

  mounted () {
    this.$_timer = setInterval(() => {
      this.$forceUpdate()
    })
  },

  beforeDestroy () {
    clearInterval(this.$_timer)
  },
}
</script>
