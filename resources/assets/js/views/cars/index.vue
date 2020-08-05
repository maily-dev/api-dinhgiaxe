<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ XE</h1>
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="auto">
        <v-text-field
          v-model="keyword"
          prefix="Tìm kiếm: "
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
        <v-autocomplete
          style="max-width:300px"
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
          hide-details
          flat
          background-color="white"
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
      <v-col v-if="brand" cols="auto">
        <v-autocomplete
          style="max-width:300px"
          prefix="Model: "
          clearable
          type="text"
          :aria-autocomplete="false"
          v-model="model"
          :items="models"
          item-text="name"
          item-value="id"
          ref="autocomplete"
          placeholder="Tất cả"
          dense
          rounded
          filled
          solo
          hide-details
          flat
          background-color="white"
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
      <!-- <v-col cols="auto">
        <v-select
          :items="status"
          style="max-width:300px"
          v-model="post_status"
          prefix="Trạng thái: "
          dense
          rounded
          filled
          solo-inverted
          hide-details
          flat
          item-value="value"
          item-text="name"
        ></v-select>
      </v-col>-->
      <v-col cols="12">
        <!-- <div>
          <v-btn color="success" rounded class="mb-3" @click="openItem()">
            <v-icon>mdi-plus</v-icon>Thêm mới
          </v-btn>
        </div>-->
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :page.sync="options.page"
          :server-items-length="totalDesserts"
          :loading="loading"
        >
          <template v-slot:item.name="{ item }">
            <v-list-item>
              <v-list-item-avatar class="c-avatar">
                <v-img
                  max-width="80"
                  class="mr-3"
                  :src="item.image||'/images/img_render/car-default.png'"
                ></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <div class="title-car-table py-2">
                  <div class="py-1 subtitle-2">{{ item.name }}</div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item.id="{ item }">
            <v-btn text @click="openItem(item)">
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
          <div v-if="itemCurrent.new" class="pa-3 title">Thêm mới</div>
          <div v-else class="pa-3 title">{{ itemCurrent._name }}</div>
          <v-spacer></v-spacer>
          <v-btn color="black" icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-actions>
        <v-card-text
          class="py-3"
          :class="{
        'disabled-wrap':itemCurrent.status===2
    }"
          style="height: 300px;"
        >
          <div class="disabled-content">
            <v-text-field
              v-model="itemCurrent.name"
              prefix="Tên: "
              filled
              flat
              background-color="white"
              rounded
            ></v-text-field>
            <div class="card-round overflow-hidden">
              <image-uploader
                v-if="dialog"
                id="fileinput"
                :debug="1"
                :maxWidth="400"
                :maxHeight="300"
                :quality="0.7"
                :autoRotate="true"
                outputFormat="file"
                :preview="false"
                :className="['fileinput', { 'fileinput--loaded' : itemCurrent.hasImage }]"
                capture="environment"
                accept="video/*, image/*"
                doNotResize="['gif', 'svg']"
                @input="setImage($event, itemCurrent)"
              >
                <label for="fileinput" slot="upload-label">
                  <div>
                    <v-img
                      min-height="200"
                      width="100%"
                      contain
                      v-if="itemCurrent.image||itemCurrent._image"
                      :src="itemCurrent._image?itemCurrent._imageBase64:itemCurrent.image"
                      alt
                    />
                    <v-card v-else flat height="200">
                      <v-row class="fill-height" align="center" justify="center">
                        <v-icon x-large color="grey lighten-2">mdi-image-plus</v-icon>
                      </v-row>
                    </v-card>
                  </div>
                </label>
              </image-uploader>
            </div>
            <div class="my-6">
              <v-btn
                v-show="!isDeleted&&!itemCurrent.new"
                class="px-6"
                rounded
                @click="deleteItem()"
                :loading="loading"
                large
              >Xóa</v-btn>
            </div>
          </div>
          <!--  -->
          <div v-show="itemCurrent.status===2" class="disabled-overlay text-center">
            <p style="margin-top:100px" class="title">Khôi phục để có thể chỉnh sửa</p>
            <v-btn color="blue" large dark class="mx-3" rounded @click="restoreItem">Khôi phục</v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="isDeleted"
            class="px-6"
            rounded
            @click="deleteItem(true)"
            :loading="loading"
            large
            block
          >Xóa</v-btn>
          <v-btn
            v-else
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
    let post_status = this.$route.query.status ? parseInt(this.$route.query.status) : null
    let keyword = this.$route.query.keyword || null
    let brand = this.$route.query.brand || null
    let model = this.$route.query.model || null
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
          text: "Tên",
          align: "start",
          value: "name"
        },
        {
          text: "Loại",
          align: "start",
          sortable: false,
          value: "type.name"
        },
        {
          text: "Năm SX",
          align: "start",
          value: "year"
        },
        {
          text: "Ngày thêm",
          value: "created_at",
          align: "end",
        },
        {
          text: "",
          value: "id",
          align: "end",
          sortable: false
        },
      ],
      post_status,
      status: [
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
        {
          name: "Deleted",
          value: 2,
        },
      ],
      brand,
      model,
      models: []
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
        this.brand = newVal.brand
        this.model = newVal.model
        //
        if (this.model && !this.brand) return
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
      setTimeout(() => {
        this.model = null
      }, 0)
      this.getModels()
      this.setRouteQueryItem("brand", val)

    },
    model(val) {
      this.setRouteQueryItem("model", val)
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
      let { data } = await this.$axios.get("admin/attribute", {
        params: {
          page,
          itemsPerPage,
          brand_id: this.brand,
          model_id: this.model,
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
      let formData = new FormData()
      formData.append("brand_slug", this.itemCurrent.brand_slug)
      formData.append("model_slug", this.itemCurrent.model_slug)
      formData.append("attribute_slug", this.itemCurrent.attribute_slug)
      formData.append("car_type_slug", this.itemCurrent.car_type_slug)
      formData.append("year", this.itemCurrent.year)

      //
      let filedata
      if (this.itemCurrent._image) {
        filedata = await new Promise((resolve, reject) => {
          new Compressor(this.itemCurrent._image, {
            quality: 0.9,
            width: 400,
            height: 300,
            success: (result) => {
              var blob = result.slice(0, result.size, 'image/png')
              resolve(new File([blob], `${this.itemCurrent.slug}_${new Date().getTime()}.png`, { type: 'image/png' }))
            },
            error: (err) => {
              console.log(err)

              reject(err)
            }
          }
          )
        })
        formData.append("image", filedata)
      }
      //
      if (this.itemCurrent.new) {

        // let { data } = await this.$axios.post(
        //   "admin/post-category",
        //   formData
        // )
        // if (data.success) {
        //   this.loading = false
        //   this.dialog = false
        //   this.desserts.unshift(data.data)
        //   this.$notyf.success({
        //     message: "Thêm thành công!",
        //     icon: false,
        //     dismissible: true
        //   })
        // }
      } else {
        let { data } = await this.$axios.put(
          "admin/car/" + this.itemCurrent._id,
          formData
        )
        if (data.success) {
          this.loading = false
          this.dialog = false
          this.desserts = this.desserts.map(item => {
            if (item._id === data.data._id) {
              //   data.data.created_at = item.created_at
              //   return data.data
              item.image = data.data.image
            }
            return item
          })
          this.$notyf.success({
            message: "Cập nhật thành công!",
            icon: false,
            dismissible: true
          })
        }
      }
    },
    async deleteItem(hard) {
      try {
        let res
        if (hard) {
          //   Xóa cứng
          let _confirm = confirm("Bạn có chắc chắn muốn xóa hoàn toàn chủ đề?\nSẼ KHÔNG THỂ KHÔI PHỤC")
          if (_confirm) {
            res = await this.$axios.delete("admin/post-category/" + this.itemCurrent.slug)
          } else {
            return
          }
        } else {
          let _confirm = confirm("Bạn có chắc chắn muốn xóa chủ đề?")
          if (!_confirm) return

          let formData = new FormData()
          formData.append("action", 2)
          res = await this.$axios.put("admin/post-category/status/" + this.itemCurrent.slug, formData)

        }
        //
        if (res.data.success) {
          if (hard) {

            this.desserts = this.desserts.filter(item =>
              item._id !== this.itemCurrent._id

            )
          } else {
            this.desserts = this.desserts.map(item => {
              if (item._id === this.itemCurrent._id) {
                item.status = 2
              }
              return item
            })
          }
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

      }
      this.$notyf.success({
        message: "Xóa thất bại!",
        icon: false,
        dismissible: true
      })
    },
    async restoreItem() {
      try {
        let formData = new FormData()
        formData.append("action", 0)
        let { data } = await this.$axios.put("admin/post-category/status/" + this.itemCurrent.slug, formData)
        if (data.success) {
          this.desserts = this.desserts.map(item => {
            if (item._id === this.itemCurrent._id) {
              item.status = 0
            }
            return item
          })
          this.$notyf.success({
            message: "Khôi phục thành công!",
            icon: false,
            dismissible: true
          })
          this.loading = false
          this.dialog = false
          return
        }

      } catch (error) {

      }
      this.$notyf.success({
        message: "Khôi phục thất bại!",
        icon: false,
        dismissible: true
      })
    },
    setImage(output, item) {
      console.log('Info', output)
      item.hasImage = true
      item._image = output
      const reader = new FileReader()
      reader.readAsDataURL(output)
      reader.onload = () => {
        item._imageBase64 = reader.result
        this.$forceUpdate()
      }
      //   reader.onerror = error => reject(error)
    },
    async getModels() {
      if (!this.brand) return
      let { data } = await this.$axios.get("admin/model", {
        params: {
          all: true,
          brand: this.brand
        }
      })
      if (data.success) {
        this.models = data.data
      }
    },
  },
  mounted() {
    this.getModels()
  }
};
</script>

<style>
.title-car-table {
  position: relative;
}
</style>
