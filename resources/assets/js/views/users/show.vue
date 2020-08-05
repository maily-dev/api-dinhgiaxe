<template>
  <v-container>
    <v-row align="center">
      <v-col cols="12" md="auto">
        <h1 v-if="isNew" class="title font-weight-black mt-3">THÊM THÀNH VIÊN</h1>
        <h1 v-else class="title font-weight-black mt-3">THÀNH VIÊN: {{formData._name}}</h1>
      </v-col>
      <v-spacer></v-spacer>
      <v-btn
        v-if="!isDeleted"
        @click="save"
        rounded
        large
        color="primary"
        class="mx-3"
        :loading="loadingSave"
      >Lưu</v-btn>
      <v-btn v-else large class="mx-3" rounded @click="deleteItem(true)">Xóa</v-btn>
    </v-row>
    <v-divider class="my-4"></v-divider>
    <div :class="{
        'disabled-wrap':isDeleted
    }">
      <v-row class="disabled-content">
        <v-col cols="12" md="auto">
          <v-card class="mb-6 card-round overflow-hidden" height="300" width="300">
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
                    height="300"
                    width="100%"
                    v-if="formData.avatar||formData._image"
                    :src="formData._image?formData._imageBase64:formData.avatar"
                    alt
                  />
                  <v-card v-else flat height="300">
                    <v-row class="fill-height" align="center" justify="center">
                      <v-icon x-large color="grey lighten-2">mdi-image-plus</v-icon>
                    </v-row>
                  </v-card>
                </div>
              </label>
            </image-uploader>
          </v-card>
        </v-col>
        <v-col>
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-textarea
              v-model="formData.name"
              :rules="rules.name"
              filled
              label="Tên"
              auto-grow
              rows="1"
              rounded
              background-color="white"
            ></v-textarea>
            <v-text-field
              v-model="formData.email"
              :rules="rules.email"
              filled
              label="Email"
              rounded
              background-color="white"
            ></v-text-field>
            <v-subheader class="px-0">Mật khẩu</v-subheader>
            <v-text-field
              :rules="[ rules.minPass]"
              type="password"
              name="input-10-2"
              label="Mật khẩu"
              hint="Ít nhất 8 ký tự"
              filled
              v-model="formData.password"
              autocomplete="off"
              rounded
              background-color="white"
            ></v-text-field>
            <v-text-field
              :rules="[v => formData.password === v||'Mật khẩu không khớp', rules.minPass]"
              v-model="formData.password_confirm"
              type="password"
              label="Nhập lại mật khẩu"
              filled
              rounded
              background-color="white"
            ></v-text-field>
            <v-subheader class="px-0">Quyền</v-subheader>
            <v-combobox
              v-model="formData.roles"
              :items="roles"
              label="Roles"
              multiple
              chips
              :return-object="true"
              item-value="id"
              item-text="name"
              filled
              rounded
              background-color="white"
            ></v-combobox>
          </v-form>
          <div v-if="!isDeleted && !isNew" class="text-right">
            <v-btn rounded @click="deleteItem()" large>Xóa thành viên</v-btn>
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

export default {
  data() {
    return {
      valid: true,
      loadingSave: false,
      roles: [],
      formData: {
        name: "",
        avatar: "",
      },
      slug: "new",
      rules: {
        name: [
          v => !!v.trim() || 'Tên là bắt buộc',
        ],
        minPass: v => !v ? true : v.length >= 8 || 'Tối thiểu 8 ký tự',
        email: [
          v => !!v || 'E-mail là bắt buộc',
          v => /.+@.+\..+/.test(v) || 'E-mail không đúng',
        ],
      }
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
    async getData() {
      try {
        let { data } = await this.$axios.get("admin/user/" + this.$route.params.id)
        if (data.success) {

          this.formData = data.data
          this.formData._name = data.data.name
        }
      } catch (error) {

      }
    },
    async getRoles() {
      try {
        let { data } = await this.$axios.get("admin/role/all")
        if (data.success) {
          this.roles = data.data
        }
      } catch (error) {

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
    async deleteItem(hard) {
      try {
        let res
        if (hard) {
          //   Xóa cứng
          let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa hoàn toàn thành viên?\nSẼ KHÔNG THỂ KHÔI PHỤC")
          if (_confirm) {
            res = await this.$axios.delete("admin/user/" + this.formData.id, {
              params: {
                force: true
              }
            })
          } else {
            return
          }
        } else {
          let _confirm = await this.$confirm("Bạn có chắc chắn muốn xóa thành viên?")
          if (!_confirm) return

          res = await this.$axios.delete("admin/user/" + this.formData.id)

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
        let { data } = await this.$axios.delete("admin/user/" + this.formData.id, {
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
      try {
        if (this.$refs.form.validate()) {
          this.loadingSave = true
          //
          let formData = new FormData()
          formData.append("name", this.formData.name)
          formData.append("email", this.formData.email)
          if (this.formData.password) {
            formData.append("password", this.formData.password)
            formData.append("password_confirm", this.formData.password_confirm)
          }
          if (this.formData.roles.length) {

            for (const role of this.formData.roles) {

              formData.append("role_ids[]", role.id)
            }
          } else {
            formData.append("no_role", true)
          }
          //
          let filedata
          if (this.formData._image) {
            filedata = await new Promise((resolve, reject) => {
              new Compressor(this.formData._image, {
                quality: 0.9,
                width: 400,
                height: 300,
                success: (result) => {
                  var blob = result.slice(0, result.size, 'image/png')
                  resolve(new File([blob], `img_${new Date().getTime()}.png`, { type: 'image/png' }))
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
          if (this.isNew) {
            // TẠO MỚI
            let { data } = await this.$axios.post(
              "admin/user/",
              formData
            )
            if (data.success) {
              this.$notyf.success({
                message: "Thêm thành công!",
                icon: false,
                dismissible: true
              })
              this.formData = data.data
              this.formData._name = data.data._name
            }
          } else {
            // UPDATE
            let { data } = await this.$axios.put(
              "admin/user/" + this.formData.id,
              formData
            )
            if (data.success) {
              this.$notyf.success({
                message: "Cập nhật thành công!",
                icon: false,
                dismissible: true
              })
              this.formData = data.data
              this.formData._name = data.data.name
            }
          }
          this.slug = data.data.id
        }
      } catch (error) {
        console.log(error)

      }
      this.loadingSave = false

    }
  },
  mounted() {
    this.slug = this.$route.params.id
    if (!this.isNew) {
      this.getData()
    }
    this.getRoles()
  }

}
</script>

<style>
</style>