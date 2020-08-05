<template>
  <div>
    <component v-bind:is="user.email ? 'default-component' : 'auth-component'"></component>
  </div>
</template>

<script>
import { mapState } from "vuex"

export default {
  components: {
    "auth-component": () => import("@/layouts/auth"),
    "default-component": () => import("@/layouts/default"),
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      user: state => state.user
    }),

  }
};
</script>
<style >
.fileinput {
  display: none;
}
</style>
