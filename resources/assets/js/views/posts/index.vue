<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ BÀI VIẾT</h1>
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
          :items="categories"
          style="min-width:300px"
          v-model="post_category_id"
          prefix="Chủ đề: "
          dense
          rounded
          filled
          solo
          hide-details
          flat
          item-value="id"
          item-text="name"
          background-color="white"
        ></v-select>
      </v-col>
      <v-col cols="auto">
        <v-select
          :items="statusList"
          style="max-width:300px"
          v-model="status"
          prefix="Trạng thái: "
          dense
          rounded
          filled
          solo
          hide-details
          flat
          item-value="value"
          item-text="name"
          background-color="white"
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
            :to="{name:'PostsShow',params:{slug:'new'}}"
            style="transform: translate(12px, 15px);"
          >
            <v-icon left>mdi-plus</v-icon>Thêm mới
          </v-btn>
          <!-- <v-btn
            color="white"
            rounded
            class="mb-3 ml-3"
            :to="{name:'PostsShow',params:{slug:'new'}}"
          >
            <v-icon left>mdi-trash-can-outline</v-icon>Thùng rác
          </v-btn>-->
        </div>
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :page.sync="options.page"
          :server-items-length="totalDesserts"
          :loading="loading"
          class="card-round pt-5"
        >
          <template v-slot:item.rate="{ item }">
            <v-avatar class="elevation-3" :color="`orange lighten-${5-item.rate+1}`">
              <span class="black--text headline font-weight-black">{{item.rate}}</span>
            </v-avatar>
          </template>
          <template v-slot:item.created_by="{ item }">
            <v-list-item>
              <v-list-item-avatar size="24" class="elevation-3">
                <v-img contain :src="item.created_by.avatar"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{item.created_by.name }}</v-list-item-title>
                <v-list-item-title>{{item.created_by.email }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:item.car="{ item }">
            <v-breadcrumbs
              class="px-0 py-2"
              v-if="item.car"
              :items="[
                {
                  text: item.car.brand.name,
                  disabled: false,
                },
                {
                  text: item.car.model?item.car.model.name:null,
                  disabled: false,
                },
                {
                  text: item.car.attribute?item.car.attribute.name:null,
                  disabled: false,
                }
              ]"
            ></v-breadcrumbs>
            <div>{{item.year}}</div>
          </template>
          <template v-slot:item.title="{ item }">
            <a
              class="body-1 py-3 d-inline-block black--text"
              target="_blank"
              :href="`https://dinhgiaxe.vn/bai-viet/${item.slug}`"
            >
              <v-avatar
                v-if="item.primary_index"
                color="cyan"
                class="d-inline-block white--text caption"
                size="20"
              >{{item.primary_index}}</v-avatar>
              {{item.title}}
            </a>
          </template>
          <template v-slot:item.status="{ item }">
            <span
              class="font-weight-bold"
              :class="{
                'green--text': item.status === 1,
                'red--text': item.status === 2,
            }"
            >{{item.deleted_at?'Deleted': item.status === 1? 'Public': 'Private'}}</span>
          </template>
          <template v-slot:item.category="{ item }">{{item.category?item.category.name:''}}</template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item.id="{ item }">
            <v-btn :to="{name:'PostsShow',params:{slug:item.slug}}" rounded text>
              <v-icon left>mdi-pencil</v-icon>Sửa
            </v-btn>
          </template>
          <template v-slot:body.append>
            <tr v-show="loading">
              <td colspan="6">
                <v-progress-linear height="3" indeterminate></v-progress-linear>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { boolean } from '../../utils'

export default {
  data() {
    let status = this.$route.query.status ? parseInt(this.$route.query.status) : null
    let deleted = this.$route.query.deleted ? 1 : null

    let post_category_id = this.$route.query.post_category_id || null
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
      itemCurrent: {},
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options,
      keyword,
      headers: [
        {
          text: "Bài viết",
          align: "start",
          value: "title",
          width: "400px"
        },

        {
          text: "Chủ đề",
          value: "category",
          sortable: false
        },
        // {
        //   text: "Tạo bởi",
        //   value: "created_by",
        //   sortable: false
        // },
        {
          text: "Thời gian",
          value: "created_at",
          align: "end",
        },
        {
          text: "Lượt xem",
          value: "view",
        },
        {
          text: "Trạng thái",
          value: "status",
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
      categories: [],
      status,
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
      post_category_id,
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    })
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
        this.post_category_id = newVal.post_category_id
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
    post_category_id(val) {
      this.setRouteQueryItem("post_category_id", val)
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
        //
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
      let { data } = await this.$axios.get("admin/post", {
        params: {
          page,
          rowsPerPage: itemsPerPage,
          keyword: this.keyword,
          post_category_id: this.post_category_id,
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
    async getCategories() {
      let { data } = await this.$axios.get("admin/post-category", {
        params: {
          all: true,
        }
      })
      if (data.success) {
        this.categories = [{
          name: "Tất cả",
          id: null,
        }, ...data.data]
      }
    },
  },
  mounted() {
    this.getCategories()

  }
};
</script>

<style>
.title-car-table {
  position: relative;
}
</style>
