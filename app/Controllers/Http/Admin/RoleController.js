'use strict'
const Role = use("Adonis/Acl/Role")
const { slug } = use('App/Helpers/Utils')
const Cache = use('App/Helpers/Cache')
class RoleController {
    async index({ request, response, view }) {
        try {
            let {
                sortBy,
                sort,
                page,
                rowsPerPage
            } = request.get()

            page = page ? parseInt(page) : 1
            rowsPerPage = rowsPerPage ? parseInt(rowsPerPage) : 10
            sortBy = sortBy || 'created_at'
            sort = sort || 'desc'
            let key = `admin-roles-${sortBy}-${sort}-${page}-${rowsPerPage}` // key lấy data
            roleCache = roleCache || {}
            if (!roleCache[key]) {
                roleCache[key] = await Role.query()
                    .with('permissions')
                    .orderBy(`${sortBy}`, `${sort}`)
                    .paginate(page, rowsPerPage)
            }
            await Cache.saveCache('roles', roleCache)

            return response.json({ success: true, data: roleCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }
    async all({ request, response, view }) {
        try {
            let {
                sortBy,
                sort
            } = request.get()
            let roleCache = await Cache.getCache('roles')
            let key = `admin-all-roles-${sortBy}-${sort}` // key lấy data
            roleCache = roleCache || {}
            if (!roleCache[key]) {
                roleCache[key] = await Role.query()
                    .fetch()
            }
            await Cache.saveCache('roles', roleCache)
            return response.json({ success: true, data: roleCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    async create({ request, response, view }) {
        try {
            let { name, description, listPermissionID } = request.post()
            let slugName = slug(name)
            let check = await Role.query().where({ slug: slugName }).first()
            if (check) return response.json({ success: false, message: 'Role đã tồn tại' })
            let role = await Role.create({
                name,
                description,
                slug: slugName,
            })
            if ((listPermissionID || []).length) await role.attach(listPermissionID)
            await this.clearCache()
            return response.json({ success: true, data: role })
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async show({ params, request, response, view }) {
        try {
            let { slug } = params
            let role = await Role.query().where({ slug }).with('permissions').first()
            //
            if (role) return response.json({ success: true, data: role })
            else return response.status(404).json({ success: false, message: 'Không tìm thấy' })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }
    async update({ params, request, response }) {
        try {
            let { slug } = params
            let role = await Role.query().where({ slug }).first()
            //
            let { name, description, listPermissionID, isChangePermisson } = request.post()
            role.name = name
            role.description = description
            // role.slug = slugFn(name)
            await role.save()
            if (isChangePermisson) {
                await role.permissions().delete()
                await role.permissions().attach(listPermissionID)
            }
            await this.clearCache()
            return response.json({ success: true, data: role })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async destroy({ params, request, response }) {
        try {
            let { slug } = params
            let role = await Role.query().where({ slug }).first()
            //
            if (role) {
                await role.permissions().delete()
                await role.delete()
                await this.clearCache()
                return response.json({ success: true, message: 'Xóa thành công' })
            }
            else return response.status(404).json({ success: false, message: 'Không tìm thấy' })
            //
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('roles'),
            Cache.removeCache('permissions')
        ])
    }
}

module.exports = RoleController
