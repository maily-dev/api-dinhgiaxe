<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ HÃNG XE</h1>
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
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="listData"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
          hide-default-footer
          class="card-round pt-5"
        >
          <template v-slot:item.name="{ item }">
            <v-list-item>
              <v-list-item-avatar class="c-avatar">
                <v-img contain :src="item.image||''"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <div class="title-car-table py-2">
                  <div class="py-1 subtitle-2 text-capitalize">{{ item.name }}</div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:item.slug="{ item }">
            <v-btn
              :to="{
              name: 'Models',
              query:{
                  brand: item.id,
                    }
                }"
              text
              @click.stop
            >
              <v-icon left>mdi-file-tree</v-icon>Models
            </v-btn>
          </template>
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>
          <template v-slot:item.id="{ item }">
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
          <div class="card-round overflow-hidden">
            <image-uploader
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
              v-show="!itemCurrent.new"
              class="px-6"
              rounded
              @click="deleteItem()"
              :loading="loading"
              large
            >Xóa</v-btn>
          </div>
          <!--  -->
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
import Compressor from 'compressorjs'

export default {
  data() {
    return {
      dialog: false,
      itemCurrent: null,
      totalDesserts: 0,
      desserts: [],
      loading: true,
      options: {},
      keyword: null,
      headers: [
        {
          text: "Tên",
          align: "start",
          value: "name"
        },
        {
          text: "Models",
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
          value: "id",
          align: "end",
          sortable: false
        },
      ],
      status: [
        {
          text: "Tất cả",
          value: null,
        },
        {
          text: "Xe mới",
          value: "new",
        },
        {
          text: "Xe cũ",
          value: "used",
        },
      ],
    }
  },
  computed: {
    ...mapState({
      makers: state => state.makers
    }),
    listData() {
      if (!this.keyword) return this.desserts
      return this.desserts.filter(item => item.name.toLowerCase().includes(this.keyword.toLowerCase()))
    },
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi().then(data => {
          this.desserts = data.items
          this.totalDesserts = data.total
        })
      },
      deep: true
    },
  },
  methods: {
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

        let itemsData = await this.getDatas(page)
        let items = itemsData.data

        const total = itemsData.data.length

        this.loading = false
        resolve({
          items,
          total
        })
      })
    },
    async getDatas(page) {
      let { data } = await this.$axios.get("admin/brand", {
        params: {
          keyword: this.keyword,
        }
      })
      if (data.success) {
        return data
      }
    },
    async update() {
      this.loading = true
      //
      let formData = new FormData()
      formData.append("name", this.itemCurrent.name)
      formData.append("slug", this.itemCurrent.slug)
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
      let { data } = await this.$axios.put(
        "admin/brand/" + this.itemCurrent._id,
        formData
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
        this.$notyf.success({
          message: "Cập nhật thành công!",
          icon: false,
          dismissible: true
        })
      }
    },
    async deleteItem() {
      try {
        let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa hoàn toàn bình luận?\nSẼ KHÔNG THỂ KHÔI PHỤC")
        if (_confirm) {
          this.loading = true
          let { data } = await this.$axios.delete(
            "admin/brand/" + this.itemCurrent._id
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
      } catch (error) {
        if (error)
          this.$notyf.error({
            message: "Xóa thất bại!",
            icon: false,
            dismissible: true
          })
      }
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
  }
};
</script>

<style>
.title-car-table {
  position: relative;
}
</style>
