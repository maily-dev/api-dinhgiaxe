<template>
  <v-container>
    <h1 class="title font-weight-black mt-3 text-uppercase">
      QUẢN LÝ ATTRIBUTES CỦA XE
      <span class="green--text">{{$route.query.name}}</span>
    </h1>
    <v-divider class="my-4"></v-divider>
    <v-row>
      <v-col cols="auto">
        <v-text-field
          v-model="keyword"
          prefix="Tìm kiếm: "
          hide-details
          dense
          rounded
          filled
          solo-inverted
          flat
          clearable
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
          @click:row="openItem"
          hide-default-footer
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
          <template
            v-slot:item.created_at="{ item }"
          >{{item.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</template>

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
    <v-dialog v-model="dialog" scrollable max-width="70vw">
      <v-card v-if="itemCurrent">
        <div class="pa-3 title">{{ itemCurrent._name }}</div>
        <v-divider></v-divider>
        <v-card-text class="py-3" style="height: 80vh;">
          <v-text-field
            v-model="itemCurrent.name"
            prefix="Tên: "
            dense
            rounded
            filled
            solo-inverted
            flat
          ></v-text-field>
          <!--  -->
          <v-divider></v-divider>
          <v-btn color="success" class="my-3" rounded @click="addYear">
            <v-icon left>mdi-plus</v-icon>Thêm năm sản xuất
          </v-btn>

          <v-card v-for="(year, index) in itemCurrent.years" :key="index" class="mb-3">
            <v-row class="px-3">
              <v-col>
                <v-text-field
                  v-model="year.year"
                  type="number"
                  prefix="NSX: "
                  dense
                  filled
                  solo-inverted
                  flat
                  rounded
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  rounded
                  color="red lighten-2"
                  @click="deleteCarYearItem(year)"
                  :loading="year.loading"
                  dark
                >Xóa</v-btn>
              </v-col>
            </v-row>
            <div style="width: 100%;" class="pb-4">
              <image-uploader
                :id="`fileinput_${year.year}`"
                :debug="1"
                :maxWidth="400"
                :maxHeight="300"
                :quality="0.7"
                :autoRotate="true"
                outputFormat="file"
                :preview="false"
                :className="['fileinput', { 'fileinput--loaded' : year.hasImage }]"
                capture="environment"
                accept="video/*, image/*"
                doNotResize="['gif', 'svg']"
                @input="setImage($event, year)"
              >
                <label :for="`fileinput_${year.year}`" slot="upload-label">
                  <div>
                    <v-img
                      height="100"
                      width="100%"
                      contain
                      v-if="year.image||year._image"
                      :src="year._image?year._imageBase64:year.image"
                      alt
                    />
                    <v-card v-else flat height="100">
                      <v-row class="fill-height" align="center" justify="center">
                        <v-icon x-large color="grey lighten-2">mdi-image-plus</v-icon>
                      </v-row>
                    </v-card>
                  </div>
                </label>
              </image-uploader>
            </div>
          </v-card>
          <!-- <v-text-field
            v-model="itemCurrent.year"
            type="number"
            prefix="Năm sản xuất: "
            dense
            rounded
            filled
            solo-inverted
            flat
          ></v-text-field>-->
          <!--  -->
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="black" text @click="dialog = false">Close</v-btn>
          <v-btn color="red" text @click="deleteItem" :loading="loading">Xóa</v-btn>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="update" :loading="loading">Lưu</v-btn>
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
          sortable: false,
          value: "name"
        },
        {
          text: "Ngày thêm",
          value: "created_at",
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
    async openItem(item) {
      console.log(item)

      this.itemCurrent = Object.assign({}, item)
      this.itemCurrent._name = this.itemCurrent.name
      this.itemCurrent.years = await this.getYears()
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
      let { data } = await this.$axios.get("admin/attribute", {
        params: {
          brand_slug: this.$route.params.brand_slug,
          model_slug: this.$route.params.model_slug,
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
      formData.append("brand_slug", this.$route.params.brand_slug)
      formData.append("model_slug", this.$route.params.model_slug)
      formData.append("attribute_slug", this.itemCurrent.slug)
      //
      for (let index = 0; index < this.itemCurrent.years.length; index++) {
        const item = this.itemCurrent.years[index]
        let filedata
        if (item._image) {
          filedata = await new Promise((resolve, reject) => {
            new Compressor(item._image, {
              quality: 0.9,
              width: 400,
              height: 300,
              success: (result) => {
                var blob = result.slice(0, result.size, 'image/png')
                resolve(new File([blob], `${this.$route.params.brand_slug}_${this.$route.params.model_slug}_${this.itemCurrent.slug}_${item.year}_${new Date().getTime()}.png`, { type: 'image/png' }))
              },
              error: (err) => {
                console.log(err)

                reject(err)
              }
            }
            )
          })
        }

        formData.append("images[]", filedata)
        formData.append("years[]", item.year)
      }

      //

      let { data } = await this.$axios.put(
        "admin/attribute/" + this.itemCurrent._id,
        formData,
        {          headers: {
            'Content-Type': 'multipart/form-data'
          }        }
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
          "admin/attribute/" + this.itemCurrent._id
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
    async deleteCarYearItem(item) {
      let _confirm = confirm("Bạn có chắc chắn muốn xóa!")
      if (_confirm) {
        item.loading = true
        let { data } = await this.$axios.delete(
          "admin/car/" + item._id
        )
        if (data.success) {
          this.itemCurrent.years = this.itemCurrent.years.filter(
            i => i._id !== item._id
          )

          this.$notyf.success({
            message: "Xóa thành công!",
            icon: false,
            dismissible: true
          })
          item.loading = false
          this.$forceUpdate()
        }
      }
    },
    async getYears() {
      let { data } = await this.$axios.get("admin/attribute/years", {
        params: {
          brand_slug: this.$route.params.brand_slug,
          model_slug: this.$route.params.model_slug,
          attribute_slug: this.itemCurrent.slug,
        }
      })
      if (data.success) {
        return data.data
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
    },
    addYear() {
      this.itemCurrent.years.unshift(
        {
          year: "0"
        }
      )
      this.$forceUpdate()

    }
  }
};
</script>

<style>
.title-car-table {
  position: relative;
}
</style>
