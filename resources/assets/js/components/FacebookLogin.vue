<template>
  <v-btn class="number" block v-bind="$attrs" color="blue" rounded @click="socialLogin('facebook')">
    <v-icon left>mdi-facebook</v-icon>
    <slot>Facebook</slot>
  </v-btn>
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  data() {
    return {
      win: null
    }
  },
  methods: {
    ...mapMutations(['setUser', 'setToken']),
    socialLogin(provider) {
      this.win = window.open(`/api/auth/social/${provider}`, '_blank')
      this.win.focus()
      //
      window.addEventListener("message", (event) => {
        if (event.data && event.data.name && event.data.name === "dinhgiaxe")
          this.socialLoginCallback(event.data)
        return
      }, false)


    },
    socialLoginCallback(query) {
      this.$axios
        .get('/auth/social/callback/facebook', {
          params: query
        })
        .then(({ data }) => {
          this.win.close()
          if (data.user.roles && data.user.roles.length > 0) {

            this.setToken(data.token)
            this.setUser(data.user)
          } else {
            this.$emit("error-auth", 403)
          }
        })
        .catch((err) => { })
    }
  }
}
</script>

<style></style>
