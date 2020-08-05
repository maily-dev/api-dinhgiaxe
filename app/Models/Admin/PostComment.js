'use strict'

const Model = use('Model')
const uuid = use('uuid')
const PostCommentFilter = use('App/ModelFilters/Admin/PostCommentFilter')

class Comment extends Model {

    static boot() {
        super.boot()
        this.addTrait('@provider:Filterable', PostCommentFilter)

        this.addHook('beforeCreate', instance => {
            instance.primaryKeyValue = uuid.v4()
        })
    }

    static get table() {
        return '06_03_post_comments'
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

    children() {
        return this.hasMany('App/Models/Admin/PostComment', 'id', 'parent_id')
    }

    by() {
        return this.belongsTo('App/Models/Admin/User')
    }

    post() {
        return this.belongsTo('App/Models/Admin/Post')
    }
}

module.exports = Comment
