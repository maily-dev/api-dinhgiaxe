'use strict'

const { default: slugify } = require('slugify')
const Model = use('Model')
const uuid = use('uuid')
const PostCategoryFilter = use('App/ModelFilters/Admin/PostCategoryFilter')

class PostCategory extends Model {

  static boot() {
    super.boot()
    //Soft delete
    this.addTrait('@provider:Lucid/SoftDeletes')
    this.addTrait('@provider:Filterable', PostCategoryFilter)

    // Thêm Slug
    this.addHook('beforeSave', (modelInstance) => {
      if (!modelInstance.slug) modelInstance.slug = slugify(modelInstance.name)
    })

    this.addHook('beforeCreate', instance => {
      instance.primaryKeyValue = uuid.v4()
    })
  }

  static get table() {
    return '06_01_post_categoies'
  }

  static get incrementing() {
    return false
  }

  setStatus(val) {
    return parseInt(val) || 0
  }

  getStatus(val) {
    return parseInt(val) || 0
  }

  posts() {
    return this.hasMany('App/Models/Post', 'id', 'post_category_id')
  }
}

module.exports = PostCategory
