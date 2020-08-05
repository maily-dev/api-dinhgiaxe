<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ XE ĐÁNH GIÁ XE</h1>
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
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
          class="card-round pt-5"
        >
          <template v-slot:item.rate="{ item }">
            <v-avatar class="c-avatar" :color="`orange lighten-${5-item.rate+1}`">
              <span class="black--text headline font-weight-black">{{item.rate}}</span>
            </v-avatar>
          </template>
          <template v-slot:item.by="{ item }">
            <v-list-item>
              <v-list-item-avatar size="24" class="c-avatar">
                <v-img contain :src="item.by.avatar"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{item.by.name }}</v-list-item-title>
                <v-list-item-title>{{item.by.email }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:item.carResultHistory="{ item }">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>{{item.attribute.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ `Max: ${item.carResultHistory.max} - Min: ${item.carResultHistory.max}` }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ `${item.carResultHistory.mileage}Km - Trạng thái: ${item.carResultHistory.condition}` }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </template>
          <!-- <template v-slot:item.condition="{ item }">
            <v-chip v-if="item.condition === 'new'" color="green" text-color="white" small>Xe mới</v-chip>
            <v-chip v-else small>Xe cũ</v-chip>
          </template>-->

          <template v-slot:item.content="{ item }">
            <!-- <v-btn icon @click="openItem(item)">
              <v-icon>mdi-comment-eye</v-icon>
            </v-btn>-->
            <p>{{item.content}}</p>
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
              <td colspan="7">
                <v-progress-linear height="3" indeterminate></v-progress-linear>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-dialog v-model="dialog" scrollable max-width="500px">
      <v-card>
        <v-card-actions>
          <div class="pa-3 title">Nội dung</div>
          <v-spacer></v-spacer>
          <v-btn color="black" icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>

        <v-card-text class="py-3" style="height: 300px;">
          <div class="mb-3">{{itemCurrent.content}}</div>
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
import { boolean } from '../utils'

export default {
  data() {
    let status = this.$route.query.status ? parseInt(this.$route.query.status) : null
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
    return {
      dialog: false,
      itemCurrent: {},
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options,
      keyword,
      status,
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
          text: "Rate",
          align: "start",
          value: "rate"
        },
        {
          text: "Xe",
          value: "carResultHistory",
          sortable: false
        },
        {
          text: "User",
          value: "by",
          sortable: false
        },
        {
          text: "Content",
          value: "content",
          sortable: false
        },
        {
          text: "Thời gian",
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
      condition: null,
      timeout: null,
      models: [],
      attributes: [],
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
      let { data } = await this.$axios.get("admin/car-review", {
        params: {
          page,
          itemsPerPage,
          keyword: this.keyword,
          status: this.status,
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
        "admin/car-review/" + this.itemCurrent.id,
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
          res = await this.$axios.delete("admin/car-review/" + this.itemCurrent.id)
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
