<template>
  <p class="bit-sponsor">
      <span @click="add">This project is sponsored by {{ num }}</span>
    </a>
  </p>
</template>
<script>
export default {
    data () {
        return {
            num: 1
        }
    },
    methods: {
        add() {
            this.num++
        }
    },
    mounted () {
        console.log(123);
    }
}
</script>
<style lang="stylus">
.bit-sponsor
  font-weight 600
  background-color #f3f6f8
  padding 0.6em 1.2em
  border-radius 8px
  display inline-block
  margin 1em 0 !important
  a
    color #999
  img
    height 40px
    margin-left 15px
  img, span
    vertical-align middle
</style>
