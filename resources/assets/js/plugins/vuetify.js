import Vue from "vue"
import Vuetify from "vuetify"

Vue.use(Vuetify)

const opts = {
  theme: {
    themes: {
      light: {
        // primary: "#46c93a",
        primary: "#2196f3",
        secondary: "#333333",
        accent: "#82B1FF",
        error: "#ff4757",
        info: "#2196F3",
        success: "#46c93a",
        warning: "#ffba00"
      }
    }
  }
}

export default new Vuetify(opts)
