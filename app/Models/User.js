'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')
const uuid = use('uuid')
const UserFilter = use('App/ModelFilters/Admin/UserFilter')
/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class User extends Model {
    static get table() {
        return '02_01_users'
    }

    static boot() {
        super.boot()

        /**
         * A hook to hash the user password before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (userInstance) => {
            if (userInstance.dirty.password) {
                userInstance.password = await Hash.make(userInstance.password)
            }
        })

        this.addHook('beforeCreate', async userInstance => {
            userInstance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', UserFilter)
    }

    static get traits() {
        return [
            '@provider:Adonis/Acl/HasRole',
            '@provider:Adonis/Acl/HasPermission'
        ]
    }

    static get incrementing() {
        return false
    }

    static get deleteTimestamp() {
        return null
    }

    static get hidden() {
        return ['id', 'password', 'updated_at', 'deleted_at']
    }

    tokens() {
        return this.hasMany('App/Models/Token', 'id', 'user_id')
    }

    carReviews() {
        return this.hasMany("App/Models/CarReview", "id", "user_id") // (model con, khóa chính model cha, khóa ngoại model con )
    }

    carResultHistories() {
        return this.hasMany("App/Models/CarResultHistory", 'id', 'user_id')
    }

    postComments() {
        return this.hasMany("App/Models/PostComment", 'id', 'user_id')
    }
}

module.exports = User
