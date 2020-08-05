<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">BÌNH LUẬN BÀI VIẾT</h1>
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
      <!-- <v-col cols="12">
        <v-switch
          v-model="deleted"
          label="Hiển thị mục đã xóa"
          hide-details
          class="my-auto"
          inset
          style="max-width:200px"
        ></v-switch>
      </v-col>-->
      <v-col cols="12">
        <!-- <div>
          <v-btn
            color="primary"
            rounded
            large
            @click="openItem()"
            style="transform: translate(12px, 15px);"
          >
            <v-icon left>mdi-plus</v-icon>Thêm mới
          </v-btn>
        </div>-->
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
          class="card-round pt-5"
        >
          <template v-slot:item.by="{ item }">
            <v-list-item>
              <v-list-item-avatar class="c-avatar">
                <v-img :src="item.by.avatar"></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <div class="subtitle-1 py-2">{{ item.by.name }}</div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:item.post="{ item }">
            <a
              class="body-1 py-3 d-inline-block black--text"
              target="_blank"
              :href="`/admin/posts/${item.post.slug}`"
            >{{item.post.title}}</a>
          </template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item.id="{ item }">
            <v-btn text @click="openItem(item)" rounded>
              <v-icon left>mdi-pencil</v-icon>Sửa
            </v-btn>
          </template>
          <template v-slot:item.status="{ item }">
            <span
              class="font-weight-bold"
              :class="{
                'green--text': item.status === 1,
                'red--text': item.status === 2,
            }"
            >{{ item.deleted_at?'Deleted': item.status === 1? 'Public': 'Private'}}</span>
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
    <v-dialog v-model="dialog" scrollable max-width="500px">
      <v-card v-if="itemCurrent" class="light-bg">
        <v-card-actions>
          <div v-if="itemCurrent.new" class="pa-3 title">Thêm mới</div>
          <div v-else class="pa-3 title">{{ itemCurrent._name }}</div>
          <v-spacer></v-spacer>
          <v-btn color="black" icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text class="py-3" style="height: 300px;">
          <div class="disabled-content">
            <v-subheader class="px-0">Nội dung bình luận</v-subheader>
            <p>{{ itemCurrent.content }}</p>
            <v-divider></v-divider>
            <v-switch
              v-if="!itemCurrent.new"
              v-model="itemCurrent.status"
              :false-value="0"
              :true-value="1"
              label="Public"
              inset
            ></v-switch>

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
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            color="blue darken-1 px-6"
            rounded
            dark
            large
            @click="update"
            :loading="loading"
            block
          >Lưu</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapState } from "vuex"
import Compressor from 'compressorjs'
import { parse } from 'url'
import { boolean } from '../../utils'

export default {
  data() {
    let status = this.$route.query.status ? parseInt(this.$route.query.status) : null
    let deleted = this.$route.query.deleted ? 1 : null
    let keyword = this.$route.query.keyword || null
    //
    let sortBy = this.$route.query.sortBy ? [this.$route.query.sortBy] : []
    let sortDesc = this.$route.query.sortDesc ? [boolean(this.$route.query.sortDesc)] : []
    let options = {
      page: this.$route.query.page ? parseInt(this.$route.query.page) : 1,
      itemsPerPage: this.$route.query.items ? parseInt(this.$route.query.items) : 10,
      sortBy,
      sortDesc,
    }
    //

    return {
      dialog: false,
      itemCurrent: null,
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options,
      keyword,
      headers: [
        {
          text: "Bình luận",
          align: "start",
          value: "content"
        },
        {
          text: "Tạo bởi",
          align: "start",
          value: "by",
          sortable: false

        },
        {
          text: "Bài viết",
          align: "start",
          value: "post",
          sortable: false

        },
        {
          text: "Ngày thêm",
          value: "created_at",
          align: "end",
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
      menuColor: false
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    }),
    isDeleted() {
      return Boolean(this.itemCurrent.deleted_at)
    }
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
        this.status = newVal.status
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
    openItem(item) {
      if (item) {
        this.itemCurrent = Object.assign({}, item)
        this.itemCurrent._name = this.itemCurrent.name
      } else {
        this.itemCurrent = Object.assign({}, {
          new: true
        })

      }
      if (!this.itemCurrent.image) this.itemCurrent.image = "#000000"
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
      let { data } = await this.$axios.get("admin/post-comment", {
        params: {
          page,
          itemsPerPage,
          keyword: this.keyword,
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
    async update() {
      this.loading = true
      //
      let formData = new FormData()
      formData.append("status", this.itemCurrent.status || 0)

      //

      let { data } = await this.$axios.put(
        "admin/post-comment/" + this.itemCurrent.id,
        formData
      )
      if (data.success) {
        this.loading = false
        this.dialog = false
        this.desserts = this.desserts.map(item => {
          if (item.id === data.data.id) {
            item.status = data.data.status
          }
          return item
        })
        this.$notyf.success({
          message: "Cập nhật thành công!",
          icon: false,
          dismissible: true
        })
      }
    },
    async deleteItem() {
      try {
        let res
        //   Xóa cứng
        let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa hoàn toàn bình luận?\nSẼ KHÔNG THỂ KHÔI PHỤC")
        if (_confirm) {
          res = await this.$axios.delete("admin/post-comment/" + this.itemCurrent.id)
        } else {
          return
        }
        //
        if (res.data.success) {

          this.desserts = this.desserts.filter(item =>
            item.id !== this.itemCurrent.id

          )
          this.$notyf.success({
            message: "Xóa thành công!",
            icon: false,
            dismissible: true
          })
          this.loading = false
          this.dialog = false
          return
        }

      } catch (error) {
        if (error)
          this.$notyf.error({
            message: "Xóa thất bại!",
            icon: false,
            dismissible: true
          })
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
