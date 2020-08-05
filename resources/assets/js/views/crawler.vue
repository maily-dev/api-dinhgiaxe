<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">CRAWLER</h1>
    <v-divider class="my-4"></v-divider>
    <v-row class="mb-6">
      <v-col cols="auto">
        <v-subheader>Từ các trang</v-subheader>
        <div class="d-flex">
          <v-checkbox
            v-model="sites"
            label="bonbanh.com"
            value="bonbanh.com"
            class="mr-6"
            hide-details
          ></v-checkbox>
          <v-checkbox v-model="sites" label="vnexpress.net" value="vnexpress.net" hide-details></v-checkbox>
        </div>
      </v-col>
      <v-col cols="12">
        <v-row>
          <v-col>
            <v-autocomplete
              prefix="Nhà sản xuất: "
              clearable
              type="text"
              :aria-autocomplete="false"
              v-model="brand_slug"
              :items="makers"
              item-text="name"
              item-value="value"
              ref="autocomplete"
              placeholder="Tất cả"
              dense
              rounded
              filled
              solo-inverted
              hide-details
              flat
            >
              <template v-slot:selection="data">
                <v-list-item-content class="py-1">
                  <v-list-item-title v-html="data.item.name"></v-list-item-title>
                </v-list-item-content>
              </template>
              <template v-slot:item="data">
                <v-list-item-content class="py-1">
                  <v-list-item-title v-html="data.item.name"></v-list-item-title>
                </v-list-item-content>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col>
            <v-select
              :items="status"
              style="min-width:300px"
              v-model="condition"
              prefix="Trạng thái: "
              dense
              rounded
              filled
              solo-inverted
              hide-details
              flat
            ></v-select>
          </v-col>
          <v-col>
            <v-text-field
              style="min-width:300px"
              v-model="page"
              prefix="Từ Trang: "
              type="number"
              dense
              rounded
              filled
              solo-inverted
              hide-details
              flat
            ></v-text-field>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12">
        <v-btn v-if="!done" color="red" large rounded dark @click="stop">
          <v-progress-circular :size="20" :width="2" class="mr-2" indeterminate color="white"></v-progress-circular>KẾT THÚC
        </v-btn>
        <v-btn v-else color="primary" large rounded @click="run" :loading="!done">QUÉT DỮ LIỆU</v-btn>
      </v-col>
    </v-row>
    <v-progress-linear
      :color="done ? 'green' : 'light-blue'"
      height="16"
      :value="process.value"
      :striped="!done"
    ></v-progress-linear>
    <v-expansion-panels v-model="viewLog" popout flat hover>
      <v-expansion-panel style="max-width: 100%;">
        <v-expansion-panel-header>
          Logs
          <div>
            <v-btn small rounded class="ml-3" @click.stop="logs=  []">
              <v-icon left>mdi-broom</v-icon>Clear
            </v-btn>
            <!-- <v-btn small rounded class="ml-3" @click.stop="reconnectSocket">
              <v-icon left>mdi-refresh</v-icon>Reconnect
            </v-btn>-->
          </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-card height="60vh" dark class="overflow-y-auto pa-3">
            <div v-for="(item, i) in logs" :key="i" class="py-1 caption">
              <span class="mr-3 grey--text">{{ item.time }}:</span>
              {{ item.content }}
            </div>
          </v-card>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script>
import { mapState } from "vuex"

export default {
  data() {
    return {
      sites: ["bonbanh.com"],
      status: [
        {
          text: "Tất cả",
          value: null,
        },
        {
          text: "Mới",
          value: "new",
        },
        {
          text: "Cũ",
          value: "used",
        },
      ],
      viewLog: false,
      logs: [],
      done: true,
      page: 1,
      brand_slug: null,
      condition: null,
      process: {
        min: 1,
        max: 2,
        value: 0
      }
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    })
  },

  methods: {

    run() {
      if (!this.done) return

      if (this.sites.includes("bonbanh.com")) {

        this.done = false
        this.bonbanhTopicSubscriptions()
        this.$axios
          .get("crawler/bon-banh/car", {
            params: {
              page: this.page,
              brand_slug: this.brand_slug,
              condition: this.condition,
            }
          })
          .catch(thrown => {

            this.done = true


          })
      }
      if (this.sites.includes("vnexpress.net")) {
        this.done = false
        this.vnexpressTopicSubscriptions()
        this.$axios
          .get("crawler/vnexpress/new-price")
          .catch(thrown => {

            this.done = true

          })
      }
    },
    stop() {
      this.$ws.$emitToServer("crawler:bonbanh", "cancel", {
        message: "cancel"
      })
      this.done = true
    },
    handleCrawlerMessageEvent(data) {
      this.done = data.message.includes("DONE!")
      var today = new Date()
      var time =
        today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
      if (this.viewLog === 0)
        this.logs.push({
          time: time,
          content: data.message
        })
      if (data.page && data.totalPage) {
        this.process.max = parseInt(data.totalPage)
        this.process.min = parseInt(data.page)
      }
    },
    bonbanhTopicSubscriptions() {
      if (!this.$ws.socket) return

      let subscription = this.$ws.socket.getSubscription(`crawler:bonbanh`)
      if (!subscription) {

        subscription = this.$ws.subscribe(`crawler:bonbanh`)

        subscription.on("message", this.handleCrawlerMessageEvent)
        subscription.on("process", data => {
          this.process.value =
            ((parseInt(data) - this.process.min) * 100) /
            (this.process.max - this.process.min)
        })
      }

    },
    vnexpressTopicSubscriptions() {
      if (!this.$ws.socket) return

      let subscription = this.$ws.socket.getSubscription(`crawler:vnexpress`)
      if (!subscription) {

        subscription = this.$ws.subscribe(`crawler:vnexpress`)

        subscription.on("message", this.handleCrawlerMessageEvent)
      }

      // subscription.on("process", data => {
      //   this.process.value =
      //     ((parseInt(data) - this.process.min) * 100) /
      //     (this.process.max - this.process.min)
      // })
    },
    reconnectSocket() {
      this.bonbanhTopicSubscriptions()
      this.vnexpressTopicSubscriptions()
    }

  },
  mounted() {
    this.reconnectSocket()
  }
};
</script>
<style>
.v-expansion-panel-content__wrap {
  padding: 0;
}
</style>
