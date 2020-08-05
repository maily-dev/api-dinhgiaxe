'use strict'

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory')
const User = use('App/Models/User')

class UserSeeder {
    async run() {
        // const userData = [
        //     {
        //         name: 'Admin',
        //         email: 'admin@dinhgiaxe.vn',
        //         password: '12345678',
        //         gender: 1,
        //         avatar: `https://i.pravatar.cc/300?img=49`
        //     },
        //     {
        //         name: 'Writer',
        //         email: 'writer@dinhgiaxe.vn',
        //         password: '12345678',
        //         gender: 1,
        //         avatar: `https://i.pravatar.cc/300?img=50`
        //     },
        //     {
        //         name: 'Developer',
        //         email: 'developer@dinhgiaxe.vn',
        //         password: '12345678',
        //         gender: 1,
        //         avatar: `https://i.pravatar.cc/300?img=51`
        //     },
        // ]

        // console.log(`Seeder: User (Số lượng: ${userData.length})`)
        // await Factory.model('App/Models/User').createMany(
        //   userData.length,
        //   userData
        // )

        let user = await Promise.all([
            this.createAdmin(),
            this.createWriter(),
            this.createDeveloper(),
        ])
        console.log(`Seeder: User (Số lượng: ${user.length})`)
    }
    async createAdmin() {
        User.findOrCreate(
            {
                email: "admin@dinhgiaxe.vn",

            },
            {
                name: "Admin",
                email: "admin@dinhgiaxe.vn",
                password: "123123123",
                gender: 'male',
                avatar: `https://i.pravatar.cc/300?img=49`
            }
        )
    }
    async createWriter() {
        User.findOrCreate(
            {
                email: "writer@dinhgiaxe.vn",

            },
            {
                name: 'Writer',
                email: 'writer@dinhgiaxe.vn',
                password: '123123123',
                gender: 'female',
                avatar: `https://i.pravatar.cc/300?img=50`
            }
        )
    }
    async createDeveloper() {
        User.findOrCreate(
            {
                email: "developer@dinhgiaxe.vn",

            },
            {
                name: 'Developer',
                email: 'developer@dinhgiaxe.vn',
                password: '123123123',
                gender: 'male',
                avatar: `https://i.pravatar.cc/300?img=51`
            }
        )
    }
}

module.exports = UserSeeder
