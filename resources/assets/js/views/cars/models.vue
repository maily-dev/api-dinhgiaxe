<template>
  <v-container>
    <h1 class="title font-weight-black mt-3 text-uppercase">QUẢN LÝ MODEL XE</h1>
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
        >
          <!-- <template v-slot:append>
            <v-btn text @click.stop="search">
              <v-icon>mdi-magnify</v-icon>
            </v-btn>
          </template>-->
        </v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-autocomplete
          prefix="Hãng xe: "
          clearable
          type="text"
          :aria-autocomplete="false"
          v-model="brand"
          :items="makers"
          item-text="name"
          item-value="id"
          ref="autocomplete"
          placeholder="Tất cả"
          dense
          rounded
          filled
          solo
          background-color="white"
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
      <v-col cols="12">
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
              <v-list-item-avatar class="elevation-3">
                <v-icon>mdi-tag</v-icon>
              </v-list-item-avatar>

              <v-list-item-content>
                <div class="title-car-table py-2">
                  <div class="py-1 subtitle-2">{{ item.name }}</div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:item.brand.name="{ item }">
            <div class="text-capitalize">{{item.brand.name}}</div>
          </template>
          <template v-slot:item.slug="{ item }">
            <v-btn
              :to="{
              name: 'Cars',
              query:{
                brand: item.brand_id,
                model: item.id,
              }
          }"
              text
              @click.stop
            >
              <v-icon left>mdi-file-tree</v-icon>Xe
            </v-btn>
          </template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item._id="{ item }">
            <v-btn text rounded @click="openItem(item)">
              <v-icon left>mdi-pencil</v-icon>Sửa
            </v-btn>
          </template>
          <template v-slot:body.append>
            <tr v-show="loading">
              <td colspan="4">
                <v-progress-linear height="3" indeterminate></v-progress-linear>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" scrollable max-width="500px">
      <v-card v-if="itemCurrent" class="light-bg">
        <v-card-actions>
          <div class="pa-3 title">{{ itemCurrent._name }}</div>
          <v-spacer></v-spacer>
          <v-btn color="black" icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="py-3" style="height: 300px;">
          <v-text-field
            v-model="itemCurrent.name"
            prefix="Tên: "
            dense
            rounded
            filled
            solo
            flat
            background-color="white"
          ></v-text-field>
          <div class="my-6">
            <v-btn
              v-show="!itemCurrent.new"
              class="px-6"
              rounded
              @click="deleteItem()"
              :loading="loading"
              large
            >Xóa</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="update" :loading="loading" large block rounded>Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import { boolean } from '../../utils'

export default {
  data() {
    let keyword = this.$route.query.keyword || null
    let brand = this.$route.query.brand || null

    //
    let sortBy = this.$route.query.sortBy ? [this.$route.query.sortBy] : []
    let sortDesc = this.$route.query.sortDesc ? [boolean(this.$route.query.sortDesc)] : []
    let options = {
      page: this.$route.query.page ? parseInt(this.$route.query.page) : 1,
      itemsPerPage: this.$route.query.items ? parseInt(this.$route.query.items) : 10,
      sortBy,
      sortDesc,
    }
    return {
      dialog: false,
      itemCurrent: null,
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options,
      keyword,
      brand,
      headers: [
        {
          text: "Tên",
          align: "start",
          value: "name"
        },
        {
          text: "Hãng xe",
          align: "start",
          sortable: false,
          value: "brand.name"
        },
        {
          text: "Types",
          align: "start",
          sortable: false,
          value: "slug"
        },
        {
          text: "Ngày thêm",
          value: "created_at",
          align: "end",
        },
        {
          text: "",
          value: "_id",
          align: "end",
          sortable: false
        },
      ],
      timeout: null,
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    }),
  },
  watch: {
    options: {
      handler(val, oldVal) {
        if (!oldVal.groupBy) {
          this.getDataFromApi().then(data => {
            this.desserts = data.items
            this.totalDesserts = data.total
          })
        } else {
          let query = Object.assign({}, this.$route.query)
          query.page = val.page
          query.items = val.itemsPerPage
          query.sortBy = val.sortBy.length > 0 ? val.sortBy[0] : undefined
          query.sortDesc = val.sortBy.length > 0 ? val.sortDesc[0] : undefined
          //
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
        this.brand = newVal.brand
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
    brand(val) {
      this.setRouteQueryItem("brand", val)
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
  // mounted() {
  //   this.getDataFromApi().then(data => {
  //     this.desserts = data.items;
  //     this.totalDesserts = data.total;
  //   });
  // },
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
    openItem(item) {
      console.log(item)

      this.itemCurrent = Object.assign({}, item)
      this.itemCurrent._name = this.itemCurrent.name
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
      let { data } = await this.$axios.get("admin/model", {
        params: {
          page,
          brand_id: this.brand,
          keyword: this.keyword,
          itemsPerPage,
          keyword: this.keyword,
          sortBy: sortBy.length > 0 ? sortBy[0] : undefined,
          sort: sortDesc.length > 0 ? (sortDesc[0] ? 'desc' : 'asc') : undefined,
        }
      })
      if (data.success) {
        return data.data
      }
    },
    async update() {
      this.loading = true
      //
      let { data } = await this.$axios.put(
        "admin/model/" + this.itemCurrent._id,
        this.itemCurrent
      )
      if (data.success) {
        this.loading = false
        this.dialog = false
        this.desserts = this.desserts.map(item => {
          if (item._id === data.data._id) {
            data.data.created_at = item.created_at
            return data.data
          }
          return item
        })
      }
    },
    async deleteItem() {
      let _confirm = confirm("Bạn có chắc chắn muốn xóa!")
      if (_confirm) {
        this.loading = true
        let { data } = await this.$axios.delete(
          "admin/model/" + this.itemCurrent._id
        )
        if (data.success) {
          this.dialog = false
          this.desserts = this.desserts.filter(
            item => item._id !== this.itemCurrent._id
          )
          this.$notyf.success({
            message: "Xóa thành công!",
            icon: false,
            dismissible: true
          })
          this.loading = false
        }
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
