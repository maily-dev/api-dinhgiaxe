import Vue from "vue"
import router from "./router"
import App from "@/App"
import vuetify from "@/plugins/vuetify" // path to vuetify export
import axios from "@/plugins/axios"
import store from "@/store"
import Ws from "@adonisjs/websocket-client"
import WsPlugin from "adonis-vue-websocket"
//
import { Notyf } from "notyf"
// import "notyf/notyf.min.css"
import ImageUploader from 'vue-image-upload-resize'
import Editor from 'vue-editor-js'
import VueSimpleAlert from "vue-simple-alert"

Vue.use(ImageUploader)
Vue.use(Editor)

Vue.use(VueSimpleAlert)
//
Vue.config.productionTip = false
const notyf = new Notyf()
Vue.prototype.$notyf = notyf
Vue.use(axios, { store, router })
Vue.use(WsPlugin, { adonisWS: Ws })
//
const moment = require('moment')
require('moment/locale/vi')

Vue.use(require('vue-moment'), {
  moment
})
//
Vue.filter("vnd", function (value) {
  if (value >= 1e9) {
    let ti = parseInt(value / 1e9)
    let tr = value - ti * 1e9

    return ti + " Tỷ " + (tr > 0 ? tr / 1e6 + " Tr" : "")
  }
  return value / 1e6 + " Tr"
})
Vue.prototype.$wait = async function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

new Vue({
  el: "#app",
  router,
  store,
  vuetify,
  components: { App },
  template: "<App/>"
})
