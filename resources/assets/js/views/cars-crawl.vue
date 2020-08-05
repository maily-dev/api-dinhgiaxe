<template>
  <v-container>
    <h1 class="title font-weight-black mt-3">QUẢN LÝ XE CRAWL</h1>
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
        ></v-text-field>
      </v-col>
      <v-col cols="auto">
        <v-select
          :items="status"
          style="min-width:300px"
          v-model="condition"
          prefix="Trạng thái: "
          dense
          rounded
          filled
          solo-inverted
          hide-details
          flat
        ></v-select>
      </v-col>
      <v-col cols="12">
        <v-data-table
          :headers="headers"
          :items="desserts"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
        >
          <template v-slot:item.name="{ item }">
            <v-list-item>
              <v-list-item-avatar class="elevation-3">
                <v-img
                  contain
                  :src="
                    `https://www.carlogos.org/car-logos/${item.brand_slug.replace(
                      /_/g,
                      '-'
                    )}-logo.png`
                  "
                ></v-img>
              </v-list-item-avatar>

              <v-list-item-content>
                <div class="title-car-table py-2">
                  <v-chip
                    x-small
                    :href="`https://${item.author_site}/${item.author_url}`"
                    target="_blank"
                    color="blue lighten-3"
                    text-color="white"
                    @click.stop
                  >
                    <v-icon left size="12">mdi-link-variant</v-icon>
                    {{ item.author_site }}
                  </v-chip>
                  <div>
                    <div class="py-1 subtitle-2">{{ item.name }}</div>
                    <div class="py-1">{{ item.priceStr }}</div>
                  </div>
                </div>
              </v-list-item-content>
            </v-list-item>
          </template>
          <template v-slot:item.condition="{ item }">
            <v-chip v-if="item.condition === 'new'" color="green" text-color="white" small>Xe mới</v-chip>
            <v-chip v-else small>Xe cũ</v-chip>
          </template>
          <template v-slot:item.brand.name="{ item }">
            <v-breadcrumbs
              class="px-0 py-2"
              :items="[
                {
                  text: item.brand.name,
                  disabled: false,
                },
                {
                  text: item.model?item.model.name:null,
                  disabled: false,
                },
                {
                  text: item.attributeId?item.attributeId.name:null,
                  disabled: false,
                }
              ]"
            ></v-breadcrumbs>
            <div>{{item.year}}</div>
          </template>
          <template v-slot:item._id="{ item }">
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
    <v-dialog v-model="dialog" scrollable max-width="600px">
      <v-card v-if="itemCurrent">
        <div class="pa-3 title">
          {{ itemCurrent._name }}
          <div>
            <v-chip
              x-small
              :href="
                `https://${itemCurrent.author_site}/${itemCurrent.author_url}`
              "
              target="_blank"
              color="blue lighten-3"
              text-color="white"
            >
              <v-icon left size="12">mdi-link-variant</v-icon>
              {{ itemCurrent.author_site }}
            </v-chip>
          </div>
        </div>
        <v-divider></v-divider>
        <v-card-text class="py-3" style="height: 300px;">
          <v-text-field
            v-model="itemCurrent.name"
            prefix="Tên: "
            dense
            rounded
            filled
            solo-inverted
            flat
          ></v-text-field>
          <v-text-field
            v-model="itemCurrent.price"
            type="number"
            prefix="Giá: "
            :suffix="itemCurrent.price | vnd"
            dense
            rounded
            filled
            solo-inverted
            flat
          ></v-text-field>
          <!--  -->
          <!-- <v-autocomplete
            prefix="Nhà sản xuất: "
            clearable
            type="text"
            :aria-autocomplete="false"
            v-model="itemCurrent.brand_slug"
            :items="makers"
            item-text="name"
            item-value="value"
            ref="autocomplete"
            placeholder="Tất cả"
            dense
            rounded
            filled
            solo-inverted
            flat
            @change="brandChange"
          >
            <template v-slot:selection="data">
              <v-list-item-content class="py-1">
                <v-list-item-title
                  v-html="(makers.filter(item => item.value === data.item)?makers.find(item => item.value === data.item): data.item).name"
                ></v-list-item-title>
              </v-list-item-content>
            </template>
            <template v-slot:item="data">
              <v-list-item-content class="py-1">
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
          <v-autocomplete
            prefix="Model: "
            clearable
            type="text"
            :aria-autocomplete="false"
            v-model="itemCurrent.model_slug"
            :items="models"
            item-text="name"
            item-value="value"
            ref="autocomplete"
            placeholder="Tất cả"
            dense
            rounded
            filled
            solo-inverted
            flat
            @focus="getModels(itemCurrent.brand_slug)"
            @change="modelChange"
          >
            <template v-slot:selection="data">
              <v-list-item-content class="py-1">
                <v-list-item-title
                  v-html="(models.find(item => item.value === data.item)?models.find(item => item.value === data.item): data.item).name"
                ></v-list-item-title>
              </v-list-item-content>
            </template>
            <template v-slot:item="data">
              <v-list-item-content class="py-1">
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>
          <v-autocomplete
            prefix="Attribute: "
            clearable
            type="text"
            :aria-autocomplete="false"
            v-model="itemCurrent.attribute_slug"
            :items="attributes"
            item-text="name"
            item-value="value"
            ref="autocomplete"
            placeholder="Tất cả"
            dense
            rounded
            filled
            solo-inverted
            flat
            @focus="getAttributes(itemCurrent.brand_slug, itemCurrent.model_slug)"
          >
            <template v-slot:selection="data">
              <v-list-item-content class="py-1">
                <v-list-item-title
                  v-html="(attributes.find(item => item.value === data.item)?attributes.find(item => item.value === data.item): data.item).name"
                ></v-list-item-title>
              </v-list-item-content>
            </template>
            <template v-slot:item="data">
              <v-list-item-content class="py-1">
                <v-list-item-title v-html="data.item.name"></v-list-item-title>
              </v-list-item-content>
            </template>
          </v-autocomplete>-->
          <v-text-field
            v-model="itemCurrent.year"
            type="number"
            prefix="Năm sản xuất: "
            dense
            rounded
            filled
            solo-inverted
            flat
          ></v-text-field>
          <!--  -->
          <!-- <v-switch
            v-model="itemCurrent.condition"
            inset
            false-value="used"
            true-value="new"
            label="Xe mới"
          ></v-switch>-->
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
          text: "Nhà SX",
          value: "brand.name",
          sortable: false
        },
        // { text: "Kiểu", value: "class.name" },
        // { text: "Thuộc tính", value: "attribute.name" },
        // { text: "", value: "author_site" },
        { text: "Trạng thái xe", value: "condition", sortable: false },
        { text: "", value: "_id", sortable: false }
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
      handler() {
        this.getDataFromApi().then(data => {
          this.desserts = data.items
          this.totalDesserts = data.total
        })
      },
      deep: true
    },
    condition(val) {
      this.getDataFromApi().then(data => {
        this.desserts = data.items
        this.totalDesserts = data.total
      })
    },
    keyword(val) {
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      this.timeout = setTimeout(() => {
        this.getDataFromApi().then(data => {
          this.desserts = data.items
          this.totalDesserts = data.total
          clearTimeout(this.timeout)
          this.timeout = null
        })
      }, 1000)
    }
  },
  methods: {
    openItem(item) {
      console.log(item)

      this.itemCurrent = Object.assign({}, item)
      this.itemCurrent._name = this.itemCurrent.name
      this.models = [
        {
          name: this.itemCurrent.model.name,
          value: this.itemCurrent.model_slug,
          brand_slug: this.itemCurrent.brand_slug,
          local: true,
        }
      ]
      if (this.itemCurrent.attribute)
        this.attributes = [
          {
            name: this.itemCurrent.attribute.name,
            value: this.itemCurrent.attribute_slug,
            brand_slug: this.itemCurrent.brand_slug,
            model_slug: this.itemCurrent.model_slug,
            local: true,

          }
        ]
      this.dialog = true
    },
    getDataFromApi() {
      this.loading = true
      return new Promise(async (resolve, reject) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options

        let itemsData = await this.getDatas(page)
        let items = itemsData.data

        const total = itemsData.total

        this.loading = false
        resolve({
          items,
          total
        })
      })
    },
    async getDatas(page) {
      let { data } = await this.$axios.get("admin/car-crawl", {
        params: {
          page,
          keyword: this.keyword,
          condition: this.condition,
        }
      })
      if (data.success) {
        return data.data
      }
    },
    async update() {
      this.loading = true
      this.itemCurrent.priceStr = this.$options.filters.vnd(
        this.itemCurrent.price + ""
      )
      let brandCurrent = this.makers.find(item => item.value === this.itemCurrent.brand_slug)
      let modelCurrent = this.models.find(item => item.value === this.itemCurrent.model_slug)
      let attributeCurrent = this.attributes.find(item => item.value === this.itemCurrent.attribute_slug)
      //
      this.itemCurrent.brand_name = brandCurrent ? brandCurrent.name : this.itemCurrent.brand_slug
      this.itemCurrent.model_name = modelCurrent ? modelCurrent.name : this.itemCurrent.model_slug
      this.itemCurrent.attribute_name = attributeCurrent ? attributeCurrent.name : this.itemCurrent.attribute_slug
      //
      let { data } = await this.$axios.put(
        "admin/car-crawl/" + this.itemCurrent._id,
        this.itemCurrent
      )
      if (data.success) {
        this.loading = false
        this.dialog = false
        this.desserts = this.desserts.map(item => {
          if (item._id === data.data._id) {
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
          "admin/car-crawl/" + this.itemCurrent._id
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
    brandChange(val) {
      if (this.models && this.models[0]) {
        if (this.models[0].brand_slug === val) return
        this.models = []
        this.attributes = []
        this.itemCurrent.model_slug = ""
        this.itemCurrent.attribute_slug = ""
      }
    },
    modelChange(val) {
      if (this.attributes && this.attributes[0]) {
        if (this.attributes[0].model_slug === val) return
        this.attributes = []
        this.itemCurrent.attribute_slug = ""
      }
    },
    async getModels(brand_slug) {

      if (this.models && this.models[0]) {
        if (this.models[0].brand_slug === brand_slug && !this.models[0].local) return
        this.models = []
      }

      let { data } = await this.$axios.get("admin/model", {
        params: {
          brand_slug
        }
      })
      //
      if (data.success) {
        this.models = data.data.map((item) => {
          return {
            name: item.name,
            value: item.slug,
            brand_slug: item.brand_slug
          }
        })
      }
    },
    async getAttributes(brand_slug, model_slug) {
      if (this.attributes && this.attributes[0]) {
        if (this.attributes[0].brand_slug === brand_slug && this.attributes[0].model_slug === model_slug && !this.attributes[0].local) return
        this.attributes = []
      }
      let { data } = await this.$axios.get("admin/attribute", {
        params: {
          brand_slug,
          model_slug,
        }
      })
      //
      if (data.success) {
        this.attributes = data.data.map((item) => {
          return {
            name: item.name,
            value: item.slug,
            brand_slug: item.brand_slug,
            model_slug: item.model_slug,
          }
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
