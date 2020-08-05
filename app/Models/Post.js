'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
const Config = use("Config")
const PostFilter = use('App/ModelFilters/Client/PostFilter')

class Post extends Model {

    static boot() {
        super.boot()
        //
        this.addHook('beforeCreate', instance => {
            instance.primaryKeyValue = uuid.v4()
        })
        //Soft delete
        this.addTrait('@provider:Lucid/SoftDeletes')
        this.addTrait('@provider:Filterable', PostFilter)

    }

    static get table() {
        return '06_02_posts'
    }

    static get incrementing() {
        return false
    }

    static get hidden() {
        return ['user_id', 'deleted_at']
    }

    setStatus(val) {
        return parseInt(val) || 0
    }

    getStatus(val) {
        return parseInt(val) || 0
    }

    getImage(val) {
        const postPath = Config.get(`drive.disks.images.post`, null)
        const domain = Config.get(`drive.disks.domain`, null)
        if (val) {
            return `${domain}${postPath}${val}`
        }
        return val
    }

    by() {
        return this.belongsTo('App/Models/User')
    }

    category() {
        return this.belongsTo('App/Models/PostCategory', 'post_category_id', 'id')
    }

    comments() {
        return this.hasMany('App/Models/PostComment', 'id', 'post_id') // (model con, khóa chính model hiện tại, khóa ngoại model con)
    }

}

module.exports = Post
