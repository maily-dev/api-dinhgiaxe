"use strict"

/*
|--------------------------------------------------------------------------
| RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Role = use("Adonis/Acl/Role")
const User = use("App/Models/User")
class RoleSeeder {
    async run() {
        let roles = await Promise.all([
            this.createAdmin(),
            this.createWrite(),
            this.createDev()

        ])
            .catch(err => {
                console.log(err)
            })
        console.log(`Seeder: Role (Số lượng: ${roles.length})`)
    }
    async createAdmin() {
        let role = await Role.findOrCreate({
            name: 'Administrator',
            slug: 'administrator',
            description: 'Full quyền'
        })
        let user = await User.query().where({ email: "admin@dinhgiaxe.vn" }).first()
        await user.roles().attach([role.id])
    }
    async createDev() {
        let role = await Role.findOrCreate({
            name: 'developer',
            slug: 'developer',
            description: 'Full quyền'
        })
        let user = await User.query().where({ email: "developer@dinhgiaxe.vn" }).first()
        await user.roles().attach([role.id])
    }

    async createWrite() {
        let role = await Role.findOrCreate({
            name: 'Writer',
            slug: 'writer',
            description: 'Quản lý về bài viết'
        })
        let user = await User.query().where({ email: "writer@dinhgiaxe.vn" }).first()
        await user.roles().attach([role.id])
    }
}

module.exports = RoleSeeder
