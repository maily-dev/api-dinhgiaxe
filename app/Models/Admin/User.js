'use strict'

const Hash = use('Hash')
const uuid = use('uuid')
const UserFilter = use('App/ModelFilters/Admin/UserFilter')
const Model = use('Model')
const Config = use("Config")

class User extends Model {
    static get table() {
        return '02_01_users'
    }

    static boot() {
        super.boot()

        this.addTrait('@provider:Lucid/SoftDeletes')

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
        return ['password']
    }

    getAvatar(val) {
        const userPath = Config.get(`drive.disks.images.user`, null)
        const domain = Config.get(`drive.disks.domain`, null)
        if (val) {
            return `${domain}${userPath}${val}`
        }
        return val
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
        return this.hasMany("App/Models/Admin/PostComment", 'id', 'user_id')
    }
}

module.exports = User
