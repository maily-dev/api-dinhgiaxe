<template>
  <v-app id="inspire">
    <v-navigation-drawer
      :value="true"
      :mini-variant="mini"
      app
      permanent
      floating
      color="white"
      touchless
    >
      <v-list dense class="py-0" v-if="user&&user.roles">
        <template v-for="(menu, i) in menus">
          <v-list-group v-if="menu.children" :key="i" append-icon="mdi-chevron-down">
            <template v-slot:activator>
              <v-tooltip right>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item-action v-bind="attrs" v-on="on">
                    <v-icon>{{ menu.icon }}</v-icon>
                  </v-list-item-action>
                </template>
                <span>{{ menu.name }}</span>
              </v-tooltip>
              <v-list-item-content>
                <v-list-item-title v-text="menu.name"></v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item v-for="subItem in menu.children" :key="i+subItem.name" :to="subItem.url">
              <v-list-item-action></v-list-item-action>
              <v-list-item-content>
                <v-list-item-title v-text="subItem.name"></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-group>
          <v-list-item
            v-else
            :key="i"
            :to="menu.url"
            v-show="user.roles.filter(role =>  menu.roles.includes(role.slug)).length>0"
            color="primary"
          >
            <v-tooltip right>
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-action v-bind="attrs" v-on="on">
                  <v-icon>{{ menu.icon }}</v-icon>
                </v-list-item-action>
              </template>
              <span>{{ menu.name }}</span>
            </v-tooltip>
            <v-list-item-content>
              <v-list-item-title>{{ menu.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar dense app class="light-bg" elevate-on-scroll clipped-right>
      <v-app-bar-nav-icon @click.stop="mini = !mini"></v-app-bar-nav-icon>
      <v-toolbar-title>Dinhgiaxe.vn</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn v-on="on" text rounded depressed class="pa-0">
            <template v-if="user.email">
              <v-avatar size="32" class="mr-3">
                <v-img v-if="user.avatar" :src="user.avatar" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
              <div class="text-left">
                <div class="body-2" style="text-transform:none;">{{ user.email }}</div>
                <div>
                  <v-chip
                    x-small
                    v-for="role in user.roles"
                    :key="role._id"
                    class="text-capitalize mr-2"
                    :color="roles[role.slug].color"
                    :text-color="roles[role.slug].textColor"
                  >{{role.slug}}</v-chip>
                </div>
                <!-- <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle> -->
              </div>
            </template>
            <template v-else>Đăng nhập</template>
          </v-btn>
        </template>
        <v-list v-if="user.email">
          <v-list-item @click="logout">
            <v-list-item-title>Đăng xuất</v-list-item-title>
          </v-list-item>
        </v-list>
        <!-- <v-card v-else min-width="330">
          <v-card-text>
            <facebook-login large />
          </v-card-text>
        </v-card>-->
      </v-menu>
    </v-app-bar>

    <v-content class="light-bg">
      <router-view></router-view>
    </v-content>
    <!-- <v-footer color="indigo">
      <span>&copy; 2019</span>
    </v-footer>-->
  </v-app>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex"
import WsSubscriptions from "@/plugins/WsSubscriptions"
import { capitalize } from '../utils'

export default {
  data: () => ({
    mini: false,
    roles: {
      developer: {
        color: "black",
        textColor: "white"
      },
      administrator: {
        color: "red",
        textColor: "white"
      },
      writer: {
        color: "blue",
        textColor: "white"
      },
    },
    menus: [
      {
        icon: "mdi-home",
        name: "Home",
        url: {
          name: "Home"
        },
        roles: [
          "developer",
          "administrator",
          "writer",
        ]
      },
      {
        icon: "mdi-download",
        name: "Crawler",
        roles: [
          "developer",
        ],
        children: [
          {
            icon: "mdi-download",
            name: "Crawler Tools",
            url: {
              name: "Crawler"
            },
            roles: [
              "developer",
            ]
          },
          {
            icon: "mdi-post",
            name: "Xe Crawl",
            url: {
              name: "CarsCrawl"
            },
            roles: [
              "developer",
            ]
          },
        ]
      },
      {
        icon: "mdi-car-hatchback",
        name: "Xe",
        roles: [
          "developer",
          "administrator",
        ],
        children: [
          {
            icon: "mdi-file-tree",
            name: "Hãng Xe",
            url: {
              name: "Brands"
            },
            roles: [
              "developer",
              "administrator",
            ]
          },
          {
            icon: "mdi-file-tree",
            name: "Model Xe",
            url: {
              name: "Models"
            },
            roles: [
              "developer",
              "administrator",
            ]
          },
          {
            icon: "mdi-file-tree",
            name: "Loại Xe",
            url: {
              name: "CarTypes"
            },
            roles: [
              "developer",
              "administrator",
            ]
          },
          {
            icon: "mdi-car-hatchback",
            name: "Xe",
            url: {
              name: "Cars"
            },
            roles: [
              "developer",
              "administrator",
            ]
          },
        ]
      },

      {
        icon: "mdi-file-document-edit",
        name: "Bài viết",
        roles: [
          "developer",
          "administrator",
          "writer",
        ],
        children: [
          {
            icon: "mdi-file-document-edit",
            name: "Bài viết",
            url: {
              name: "Posts"
            },
            roles: [
              "developer",
              "administrator",
              "writer",
            ],
          },
          {
            icon: "mdi-tag-multiple",
            name: "Chủ đề Bài viết",
            url: {
              name: "Categories"
            },
            roles: [
              "developer",
              "administrator",
              "writer",
            ]
          },
          {
            icon: "mdi-comment-text-multiple",
            name: "Bình luận bài viết",
            url: {
              name: "Comments"
            },
            roles: [
              "developer",
              "administrator",
            ]
          },
        ]
      },

      {
        icon: "mdi-comment-quote",
        name: "Đánh giá",
        url: {
          name: "CarRatings"
        },
        roles: [
          "developer",
          "administrator",
        ]
      },
      {
        icon: "mdi-account-tie",
        name: "Thành viên",
        url: {
          name: "Users"
        },
        roles: [
          "developer",
          "administrator",
        ]
      },

    ]
  }),
  computed: {
    ...mapState({
      user: state => state.user
    }),


  },
  methods: {
    ...mapActions({
      async logout(dispatch) {
        await dispatch("logout")
      }
    }),
    ...mapMutations(["setMakers"]),
    async getMarker() {
      let { data } = await this.$axios.get("admin/brand")
      if (data.success) {
        this.setMakers(
          data.data.map(item => {
            item.name = capitalize(item.name)
            item.value = item.slug
            return item
          })
        )
      }
    },
  },
  async mounted() {
    if (this.user.email) {
      console.log("welcome!")

      await WsSubscriptions()
    }

    this.getMarker()
  }
};
</script>
