<template>
  <v-app id="inspire">
    <v-app-bar color="transparent" fixed flat>
      <v-toolbar-title class="font-weight-bold">DINHGIAXE.VN</v-toolbar-title>

      <v-spacer></v-spacer>
    </v-app-bar>
    <v-content>
      <v-row no-gutters style="height:100vh">
        <v-col cols="12" sm="7" style="height:100vh">
          <v-container class="fill-height">
            <v-row align="center" justify="center">
              <v-col cols="12" sm="8">
                <v-card flat>
                  <v-card-text>
                    <h2 class="display-2 mb-8">Đăng Nhập</h2>
                    <v-form>
                      <v-text-field
                        label="Email"
                        name="login"
                        type="email"
                        :rules="rules.email"
                        :error-messages="errorLogin"
                        @focus="errorLogin = ''"
                        v-model="email"
                        outlined
                        rounded
                        solo
                        flat
                      ></v-text-field>

                      <v-text-field
                        id="password"
                        label="Mật khẩu"
                        name="password"
                        :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                        @click:append="showPass = !showPass"
                        :type="showPass ? 'text' : 'password'"
                        @keyup.enter="login"
                        v-model="password"
                        outlined
                        rounded
                        solo
                        flat
                      ></v-text-field>
                    </v-form>
                    <v-btn
                      :loading="loading"
                      color="primary"
                      rounded
                      x-large
                      block
                      class="mt-6"
                      @click="login"
                    >
                      <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                  </v-card-text>
                </v-card>
                <p class="text-center py-6 grey--text caption">
                  Bạn có thể đăng nhập tại
                  <a
                    class="px-2"
                    href="https://dinhgiaxe.vn"
                    target="_blank"
                  >dinhgiaxe.vn</a>
                </p>
              </v-col>
            </v-row>
          </v-container>
          <!-- <facebook-login dark class="mt-3" large @error-auth="errorAuth" /> -->
        </v-col>
        <v-col cols="12" sm="5" style="height:100vh">
          <v-img
            height="100%"
            gradient="to top right, rgba(100,115,201,.33), rgba(25,32,72,.7)"
            src="https://image.freepik.com/free-photo/close-up-portrait-young-woman-working-laptop-writing-coffee-table_146259-4.jpg"
          >
            <v-container class="fill-height">
              <!-- <v-row align="center" justify="center">
                <v-col class="display-1 font-weight-medium text-center">
                  <p class="primary--text">DINHGIAXE</p>
                  <p class="white--text" style="line-height:1.3em;">
                    Áp dụng AI
                    <br />hỗ trợ tìm kiếm và đánh giá thị trường để đưa ra kết quả định giá xe của bạn.
                  </p>
                </v-col>
              </v-row>-->
            </v-container>
          </v-img>
        </v-col>
      </v-row>
    </v-content>
  </v-app>
</template>

<script>
import { mapActions, mapMutations } from "vuex"
import FacebookLogin from "@/components/FacebookLogin"

export default {
  components: {
    FacebookLogin,
  },
  data() {
    return {
      email: "",
      password: "",
      showPass: false,
      remember: false,
      loading: false,
      rules: {
        email: [
          v => !!v || "E-mail là bắt buộc",
          v => /.+@.+\..+/.test(v) || "E-mail chưa đúng định dạng"
        ]
      },
      errorLogin: ""
    }
  },
  watch: {
    "$route.query"(val) {
      console.log("xppp")

    }
  },
  methods: {
    ...mapActions({
      async login(dispatch) {
        this.loading = true
        let { email, password } = this
        try {
          await dispatch("login", {
            email,
            password
          })
          // this.$router.push("/");
        } catch ({ response }) {
          let { data } = response
          this.errorLogin = data.message
          this.$notyf.error({
            message: data.message,
            icon: false,
            dismissible: true,
          })
          this.loading = false
        }
      }
    }),
    errorAuth(e) {
      if (e === 403) {
        this.errorLogin = "Bạn không có quyền truy cập"
      }
    }
  }
};
</script>
