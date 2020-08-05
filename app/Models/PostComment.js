'use strict'

const Model = use('Model')
const uuid = use('uuid')
const PostCommentFilter = use('App/ModelFilters/Client/PostCommentFilter')

class Comment extends Model {

    static boot() {
        super.boot()

        this.addHook('beforeCreate', instance => {
            instance.primaryKeyValue = uuid.v4()
        })
        this.addTrait('@provider:Filterable', PostCommentFilter)

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
        return this.hasMany('App/Models/PostComment', 'id', 'parent_id')
    }

    by() {
        return this.belongsTo('App/Models/User', 'user_id', 'id')
    }

    post() {
        return this.belongsTo('App/Models/Post')
    }
}

module.exports = Comment
