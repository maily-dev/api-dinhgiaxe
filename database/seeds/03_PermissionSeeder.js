"use strict"

/*
|--------------------------------------------------------------------------
| PermissionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const User = use("App/Models/User")
const Role = use("Adonis/Acl/Role")
const Permission = use("Adonis/Acl/Permission")
const { slug } = use('App/Helpers/Utils')
const listPermissions = [
    {
        name: 'read rating',
        group: 'rating',
    },
    {
        name: 'read and write rating',
        group: 'rating',
    },
    {
        name: 'read car crawl',
        group: 'car crawl',
    },
    {
        name: 'read and write car crawl',
        group: 'car crawl',
    },
    {
        name: 'read brand',
        group: 'brand',
    },
    {
        name: 'read and write brand',
        group: 'brand',
    },
    {
        name: 'read model',
        group: 'model',
    },
    {
        name: 'read and write model',
        group: 'model',
    },
    {
        name: 'read attribute',
        group: 'attribute',
    },
    {
        name: 'read and write attribute',
        group: 'attribute',
    },
    {
        name: 'read car',
        group: 'car',
    },
    {
        name: 'read and write car',
        group: 'car',
    },
    {
        name: 'read post',
        group: 'post'
    },
    {
        name: 'read and write post',
        group: 'post'
    },
    {
        name: 'read setting',
        group: 'setting'
    },
    {
        name: 'read and write setting',
        group: 'setting'
    },
    {
        name: 'read user',
        group: 'user'
    },
    {
        name: 'read and write user',
        group: 'user'
    },
    {
        name: 'read role',
        group: 'role'
    },
    {
        name: 'read and write role',
        group: 'role'
    },
    {
        name: 'read permission',
        group: 'permission'
    },
    {
        name: 'crawl',
        group: 'crawl'
    },
    {
        name: 'read car type',
        group: 'car type'
    },
    {
        name: 'read and write car type',
        group: 'car type'
    },
    {
        name: 'read comment',
        group: 'comment'
    },
    {
        name: 'read and write comment',
        group: 'comment'
    },

]
class PermissionSeeder {

    async run() {

        await this.initPermission(listPermissions)
        console.log(`Seeder: Permission (Số lượng: ${listPermissions.length})`)
    }
    async initPermission(listPermissions) {
        let adminPermission = []
        let devPermission = []
        let writerPermission = []
        let permissionWaiting = await listPermissions.map(
            async permission =>
                await this.createPermission(
                    permission.name,
                    permission.group,
                )
        )
        let permissions = await Promise.all(permissionWaiting)
        for (let i in permissions) {
            let permission = permissions[i]
            devPermission.push(permission.id)
            if (permission.group == 'post') writerPermission.push(permission.id)
            if (permission.group != 'car crawl') adminPermission.push(permission.id)
        }

        await Promise.all([
            this.setPermissionAdmin(adminPermission),
            this.setPermissionDev(devPermission),
            this.setPermissionWriter(writerPermission),
        ])
    }

    async createPermission(name, group) {
        let permission = await Permission.findOrCreate({
            name,
            slug: slug(name),
            group
        })

        return permission
    }

    async setPermissionAdmin(adminPermission) {
        try {
            if (!adminPermission) return
            adminPermission = adminPermission.filter(item => item)
            let role = await Role.query().where({ slug: 'administrator' }).firstOrFail()
            await role.permissions().attach(adminPermission)
        } catch (error) {
            console.log(error)
        }
    }
    async setPermissionDev(devPermission) {
        try {
            if (!devPermission) return
            devPermission = devPermission.filter(item => item)
            let role = await Role.query().where({ slug: 'developer' }).firstOrFail()
            await role.permissions().attach(devPermission)
        } catch (error) {
            console.log(error)
        }
    }

    async setPermissionWriter(writerPermission) {
        try {
            if (!writerPermission) return
            let role = await Role.query().where({ slug: 'writer' }).firstOrFail()
            await role.permissions().attach(writerPermission)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = PermissionSeeder
