<template>
<test-page />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import TestPage from '~/pages/test.vue'

export default defineComponent({
  components: {
    // IndexPage,
    TestPage
  },
  data() {
    return {}
  },
  props: {},
})
</script>

<style lang="scss">
@import '~/assets/css/default';
@import '~/assets/css/global';
</style>
