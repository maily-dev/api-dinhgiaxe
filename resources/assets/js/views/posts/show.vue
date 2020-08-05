<template>
  <v-container style="padding-bottom:100px">
    <v-row align="center">
      <v-col cols="12" md="auto">
        <h1 class="title font-weight-black mt-3" v-if="isNew">THÊM BÀI VIẾT</h1>
        <h1 class="title font-weight-black mt-3" v-else>BÀI VIẾT: {{formData._title}}</h1>
      </v-col>
      <v-spacer></v-spacer>
      <v-switch
        v-if="!isNew && !isDeleted"
        v-model="formData.status"
        :false-value="0"
        :true-value="1"
        label="Public"
        inset
        hide-details
        class="my-auto mx-3"
      ></v-switch>
      <v-btn
        v-if="!isDeleted"
        @click="save"
        rounded
        large
        color="primary"
        class="mx-3"
        :loading="loadingSave"
      >Lưu Bài viết</v-btn>
      <v-btn v-else large class="mx-3" rounded @click="deleteItem(true)">Xóa</v-btn>
    </v-row>
    <v-divider class="my-4"></v-divider>
    <div :class="{
        'disabled-wrap':isDeleted
    }">
      <v-row class="disabled-content">
        <v-col cols="12" md="8">
          <v-textarea
            v-model="formData.title"
            :disabled="isDeleted"
            filled
            label="Tiêu đề"
            auto-grow
            rows="1"
            rounded
            background-color="white"
          ></v-textarea>
          <v-textarea
            v-model="formData.description"
            :disabled="isDeleted"
            label="Nhập mô tả"
            filled
            auto-grow
            rows="2"
            rounded
            background-color="white"
          ></v-textarea>
          <v-card v-if="loadingContent" height="50vh" flat>
            <v-row class="fill-height" align="center">
              <v-col class="text-center">
                <v-progress-circular size="50" indeterminate color="primary"></v-progress-circular>
              </v-col>
            </v-row>
          </v-card>
          <v-card v-else class="card-round">
            <quill-editor v-model="formData.content" :resource-id="formData.resource_id"></quill-editor>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <h3 class="mb-3">THÔNG TIN BÀI VIẾT</h3>

          <v-subheader class="px-0">Ảnh Thumbnail</v-subheader>
          <v-card class="mb-6 card-round overflow-hidden">
            <image-uploader
              id="fileinput"
              :debug="1"
              :quality="0.7"
              :autoRotate="true"
              outputFormat="file"
              :preview="false"
              :className="['fileinput', { 'fileinput--loaded' : formData.hasImage }]"
              capture="environment"
              accept="video/*, image/*"
              doNotResize="['gif', 'svg']"
              @input="setImage($event, formData)"
            >
              <label for="fileinput" slot="upload-label">
                <div>
                  <v-img
                    min-height="200"
                    width="100%"
                    v-if="formData.image||formData._image"
                    :src="formData._image?formData._imageBase64:formData.image"
                    alt
                    contain
                  />
                  <v-card v-else flat height="200">
                    <v-row class="fill-height" align="center" justify="center">
                      <v-icon x-large color="grey lighten-2">mdi-image-plus</v-icon>
                    </v-row>
                  </v-card>
                </div>
              </label>
            </image-uploader>
          </v-card>

          <v-select
            :items="categories"
            v-model="formData.post_category_id"
            label="Chủ đề"
            filled
            item-value="id"
            item-text="name"
            :disabled="isDeleted"
            rounded
            background-color="white"
          ></v-select>
          <v-text-field
            :disabled="isDeleted"
            type="number"
            v-model.number="formData.primary_index"
            filled
            label="Bài nổi bật"
            rounded
            background-color="white"
          ></v-text-field>
          <template v-if="!isNew">
            <v-list-item v-if="formData.created_by" class="px-0">
              <v-list-item-avatar class="elevation-3">
                <v-img :src="formData.created_by.avatar"></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title>{{formData.created_by.name }}</v-list-item-title>
                <v-list-item-title>{{formData.created_by.email }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-subheader class="px-0">Ngày tạo</v-subheader>
            <p>{{formData.created_at | moment('HH:mm dddd, DD/MM/YYYY')}}</p>
            <v-subheader class="px-0">Ngày Sửa</v-subheader>
            <p>{{formData.updated_at | moment('HH:mm dddd, DD/MM/YYYY')}}</p>
          </template>
          <!--  -->
          <div v-if="!isDeleted && !isNew" class="text-right">
            <v-btn rounded @click="deleteItem()" large>Xóa bài</v-btn>
          </div>
        </v-col>
      </v-row>
      <div v-show="isDeleted" class="disabled-overlay text-center">
        <p style="margin-top:200px" class="title">Khôi phục để có thể chỉnh sửa</p>
        <v-btn color="blue" large dark class="mx-3" rounded @click="restoreItem">Khôi phục</v-btn>
      </div>
    </div>
  </v-container>
</template>

<script>
import Compressor from 'compressorjs'
import { makeId } from "@/utils"
//
import QuillEditor from "../../components/QuillEditor"
import 'quill/dist/quill.snow.css' // for snow theme
//
export default {
  components: {
    QuillEditor
  },
  data() {
    return {
      formData: {
        title: "",
        description: "",
        status: 0,
        resource_id: makeId(9)
      },
      loadingContent: true,
      loadingSave: false,
      categories: [],
      slug: "new"
    }
  },
  computed: {
    isNew() {
      return this.slug === "new"
    },
    isDeleted() {
      return Boolean(this.formData.deleted_at)
    }
  },
  methods: {
    setImage(output, item) {
      item.hasImage = true
      item._image = output
      const reader = new FileReader()
      reader.readAsDataURL(output)
      reader.onload = () => {
        item._imageBase64 = reader.result
        this.$forceUpdate()
      }
    },
    async getCategories() {
      let { data } = await this.$axios.get("admin/post-category", {
        params: { all: true }
      })
      if (data.success) {
        this.categories = data.data
      }
    },
    async getData() {
      try {
        let { data } = await this.$axios.get("admin/post/" + this.$route.params.slug)
        if (data.success) {
          // if (data.data.resource_id)
          //   this.$set(this.formData, "resource_id", data.data.resource_id)

          this.formData = data.data
          this.formData._title = data.data.title
        }
        // await this.$wait(1000)
      } catch (error) {

      }
    },
    async deleteItem(hard) {
      try {
        let res
        if (hard) {
          //   Xóa cứng
          let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa hoàn toàn bài viết?\nSẼ KHÔNG THỂ KHÔI PHỤC")
          if (_confirm) {
            res = await this.$axios.delete("admin/post/" + this.formData.slug, {
              params: {
                force: true
              }
            })
          } else {
            return
          }
        } else {
          let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa bài viết?")
          if (!_confirm) return

          res = await this.$axios.delete("admin/post/" + this.formData.slug)

        }
        //
        //
        if (res.data.success) {
          this.$notyf.success({
            message: "Xóa thành công!",
            icon: false,
            dismissible: true
          })
          this.$router.back()
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
    async restoreItem() {
      try {
        let { data } = await this.$axios.delete("admin/post/" + this.formData.slug, {
          params: {
            action: "restore"
          }
        })
        if (data.success) {
          this.formData.deleted_at = null
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
      this.$notyf.error({
        message: "Khôi phục thất bại!",
        icon: false,
        dismissible: true
      })
    },

    async save() {
      //
      if (!this.formData.post_category_id) {
        this.$notyf.error({
          message: "Chủ đề không được trống!",
          icon: false,
          dismissible: true
        })
        return
      }
      //
      this.loadingSave = true
      let formData = new FormData()
      formData.append("title", this.formData.title)
      formData.append("description", this.formData.description)
      formData.append("post_category_id", this.formData.post_category_id)
      // formData.append("post_category_id", "ac96090c-f004-4734-897d-60ce57967b01")
      formData.append("primary_index", this.formData.primary_index)
      formData.append("resource_id", this.formData.resource_id)
      formData.append("status", this.formData.status)
      formData.append("content", this.formData.content)
      //
      let filedata
      if (this.formData._image) {
        filedata = await new Promise((resolve, reject) => {
          new Compressor(this.formData._image, {
            quality: 0.9,
            maxWidth: 800,
            success: (result) => {
              var blob = result.slice(0, result.size, 'image/png')
              resolve(new File([blob], `image.png`, { type: 'image/png' }))
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
      try {

        if (this.isNew) {
          // TẠO MỚI BÀI VIẾT
          let { data } = await this.$axios.post(
            "/post",
            formData
          )
          if (data.success) {
            this.$notyf.success({
              message: "Thêm thành công!",
              icon: false,
              dismissible: true
            })
            this.formData = data.data
            this.formData._title = data.data.title
          }
        } else {
          // UPDATE
          let { data } = await this.$axios.put(
            "/post/" + this.formData.slug,
            formData
          )
          if (data.success) {
            this.$notyf.success({
              message: "Cập nhật thành công!",
              icon: false,
              dismissible: true
            })
            this.formData = data.data
            this.formData._title = data.data.title
          }
        }
        this.slug = this.formData.slug
      } catch (error) {
        const { status, data } = error.response

        if (status === 422) {
          this.$notyf.error({
            message: data.message[0].message,
            icon: false,
            dismissible: true
          })
        }

      }
      //
      this.loadingSave = false

    }
  },
  async mounted() {
    this.slug = this.$route.params.slug
    if (!this.isNew) {
      await this.getData()
    }
    await this.getCategories()
    this.loadingContent = false
  }
}
</script>

<style>
.ce-block__content {
  max-width: 100% !important;
}
</style>