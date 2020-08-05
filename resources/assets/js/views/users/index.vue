<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ THÀNH VIÊN</h1>
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="auto">
        <v-text-field
          v-model="keyword"
          prepend-inner-icon="mdi-magnify"
          placeholder="Tìm kiếm"
          hide-details
          dense
          rounded
          filled
          solo
          flat
          clearable
          background-color="white"
        ></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-select
          :items="rolesArr"
          style="min-width:300px"
          v-model="role"
          prefix="Quyền: "
          dense
          rounded
          filled
          solo
          hide-details
          flat
          background-color="white"
          item-value="value"
          item-text="name"
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-switch
          v-model="deleted"
          label="Hiển thị mục đã xóa"
          hide-details
          class="my-auto"
          inset
          style="max-width:200px"
        ></v-switch>
      </v-col>
      <v-col cols="12">
        <div>
          <v-btn
            color="primary"
            rounded
            large
            style="transform: translate(12px, 15px);"
            :to="{name:'UsersShow',params:{id:'new'}}"
          >
            <v-icon left>mdi-plus</v-icon>Thêm mới
          </v-btn>
        </div>
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
          class="card-round pt-5"
        >
          <template v-slot:item.name="{ item }">
            <v-list-item>
              <v-list-item-avatar class="c-avatar">
                <v-img v-if="item.avatar" :src="item.avatar"></v-img>
                <v-icon v-else>mdi-account</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{item.name }}</v-list-item-title>
                <v-list-item-title>{{item.email }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.roles="{ item }">
            <div>
              <v-chip
                x-small
                v-for="role in item.roles||[]"
                :key="role._id"
                class="text-capitalize mr-2 mb-2"
                :color="roles[role.slug].color"
                :text-color="roles[role.slug].textColor"
              >{{role.slug}}</v-chip>
            </div>
          </template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item.id="{ item }">
            <v-btn :to="{name:'UsersShow',params:{id:item.id}}" rounded text exact>
              <v-icon left>mdi-pencil</v-icon>Sửa
            </v-btn>
          </template>
          <template v-slot:body.append>
            <tr v-show="loading">
              <td colspan="5">
                <v-progress-linear height="3" indeterminate></v-progress-linear>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" scrollable max-width="70vw">
      <v-card>
        <div class="pa-3 title">Nội dung</div>
        <v-divider></v-divider>
        <v-card-text class="py-3" style="height: 300px;">{{itemCurrent.content}}</v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black" text @click="dialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex"

export default {
  data() {
    let status = this.$route.query.status ? parseInt(this.$route.query.status) : null
    let deleted = this.$route.query.deleted ? 1 : null
    let role = this.$route.query.role || null

    let keyword = this.$route.query.keyword || null
    let sortBy = this.$route.query.sortBy ? [this.$route.query.sortBy] : []
    let sortDesc = this.$route.query.sortDesc ? [boolean(this.$route.query.sortDesc)] : []

    let options = {
      page: this.$route.query.page ? parseInt(this.$route.query.page) : 1,
      itemsPerPage: this.$route.query.items ? parseInt(this.$route.query.items) : 10,
      sortBy,
      sortDesc,
    }
    return {
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
      dialog: false,
      itemCurrent: {},
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options,
      keyword,
      status,
      role,
      deleted,
      statusList: [
        {
          name: "Mặc định",
          value: null,
        },
        {
          name: "Public",
          value: 1,
        },
        {
          name: "Private",
          value: 0,
        },
      ],
      headers: [
        {
          text: "Tên",
          align: "start",
          sortable: false,
          value: "name"
        },
        {
          text: "Quyền",
          value: "roles",
          sortable: false
        },
        {
          text: "Thời gian",
          value: "created_at",
          align: "end",
          sortable: false
        },
        {
          text: "",
          value: "id",
          align: "end",
          sortable: false
        },
      ],
      timeout: null,
      models: [],
      attributes: [],
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    }),
    rolesArr() {
      return [{
        name: "Tất cả",
        value: null,
      }, ...Object.keys(this.roles).map(item => ({
        name: item,
        value: item
      }))]
    }
  },
  watch: {
    options: {
      handler(val, oldVal) {
        let query = Object.assign({}, this.$route.query)
        query.page = val.page
        query.items = val.itemsPerPage
        query.sortBy = val.sortBy.length > 0 ? val.sortBy[0] : undefined
        query.sortDesc = val.sortBy.length > 0 ? val.sortDesc[0] : undefined
        //
        if (!oldVal.groupBy) {
          this.getDataFromApi().then(data => {
            this.desserts = data.items
            this.totalDesserts = data.total
          })
        } else {
          this.$router.push({
            name: this.$route.name,
            query,
          })
        }
      },
      deep: true
    },
    "$route.query": {
      handler(newVal) {
        this.keyword = newVal.keyword
        this.status = newVal.status
        this.role = newVal.role
        this.deleted = newVal.deleted

        //
        this.getDataFromApi().then(data => {
          this.desserts = data.items
          this.totalDesserts = data.total
          //
          if (this.timeout) {
            clearTimeout(this.timeout)
            this.timeout = null
          }
        })
      },
      deep: true
    },
    role(val) {
      this.setRouteQueryItem("role", val)
    },
    status(val) {
      this.setRouteQueryItem("status", val)
    },
    deleted(val) {
      this.setRouteQueryItem("deleted", val ? 1 : undefined)
    },
    keyword(val) {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      this.timeout = setTimeout(() => {
        this.options.page = 1
        this.setRouteQueryItem("keyword", val)
      }, 1000)
    }
  },
  methods: {
    setRouteQueryItem(key, val) {
      let query = Object.assign({}, this.$route.query)
      query[key] = val === 0 ? 0 : (val || undefined)

      Object.keys(query).forEach(key => query[key] === undefined && delete query[key])

      this.$router.push({
        name: this.$route.name,
        query,
      }).catch(() => { })
    },
    openItem(e) {
      this.itemCurrent = e
      this.dialog = true
    },
    getDataFromApi() {
      this.loading = true
      return new Promise(async (resolve, reject) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options

        let itemsData = await this.getDatas(page, sortBy, sortDesc, itemsPerPage)
        let items = itemsData.data

        const total = itemsData.total

        this.loading = false
        resolve({
          items,
          total
        })
      })
    },
    async getDatas(page, sortBy, sortDesc, itemsPerPage) {
      let { data } = await this.$axios.get("admin/user", {
        params: {
          page,
          rowsPerPage: itemsPerPage,
          keyword: this.keyword,
          role: this.role,
          status: this.status,
          deleted: this.deleted,
          sortBy: sortBy.length > 0 ? sortBy[0] : undefined,
          sort: sortDesc.length > 0 ? (sortDesc[0] ? 'desc' : 'asc') : undefined,
        }
      })
      if (data.success) {
        return data.data
      }
    },
  }
};
</script>

<style>
.title-car-table {
  position: relative;
}
</style>
