'use strict'

const User = use("App/Models/Admin/User")
const Drive = use('Drive')
const Helpers = use('Helpers')
const Cache = use('App/Helpers/Cache')
const { checkDate } = use('App/Helpers/Utils')
//
const Config = use("Config")
const domain = Config.get(`drive.disks.domain`, null)
const userPath = Config.get(`drive.disks.images.user`, null)
const Database = use('Database')
/**
 * Resourceful controller for interacting with users
 */
class UserController {
    /**
     * Show a list of all users.
     * GET users
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response, view }) {
        try {
            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            input.deleted = input.deleted || false
            input.role = input.role

            const cacheName = 'users'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await User.query()
                    .withTrashed()
                    .filter(input)
                    .with('roles')
                    .paginate(input.page, input.rowsPerPage)
            }

            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    async create({ request, response, view }) {
        const trx = await Database.beginTransaction()
        try {
            let { name, email, role_ids, no_role, gender, birthday, address, password } = request.post()
            let user = await User.create({
                name,
                email,
                gender,
                birthday,
                address,
                password
            }, trx)
            let image = request.file('image')
            if (image) {
                const imageUrl = `${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                await image.move(Helpers.publicPath(), {
                    name: userPath + imageUrl,
                    overwrite: true
                })
                    .catch(() => {
                        throw { message: "Không thể tải ảnh lên" }
                    })

                user.avatar = imageUrl
                await user.save(trx)
            }
            // thêm vai trò, nếu có  gửi id role
            if (no_role) {
                await user.roles().detach()
            }
            if (role_ids) {
                b
                await user.roles().attach(role_ids)
            }
            let userJson = user.toJSON()
            userJson.roles = await user.roles().fetch()

            await trx.commit()
            await Cache.removeCache('users')
            return response.json({ success: true, data: userJson })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    /**
     * Display a single user.
     * GET users/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async show({ params, request, response, view }) { // không cần thiết
        try {
            let { id } = params
            let user = await User.query()
                .withTrashed()
                .where({ id })
                .with('roles', builder => {
                    builder.select('slug', 'name', "id")
                })
                // .with('carResultHistories', builder => {
                //     builder.with('attribute')
                // })
                .first()
            //
            if (user) return response.json({ success: true, data: user })
            else return response.status(404).json({ success: false, message: 'Không tìm thấy' })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    /**
     * Update user details.
     * PUT or PATCH users/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params, request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { id } = params

            let user = await User.findOrFail(id)
            //
            let { name, email, password, role_ids, no_role, gender, birthday, address, } = request.post()
            let checkEmailExisted = await User.query().whereNot({ id }).where({ email }).first()
            if (checkEmailExisted) return response.status(422).json({ success: false, message: 'Email đã tồn tại' })
            //
            user.name = name
            user.email = email
            user.gender = gender
            user.birthday = birthday
            user.address = address
            //
            if (password) user.password = password
            //
            let image = request.file('image')
            if (image) {
                if (user.avatar) {
                    await Drive.delete(Helpers.publicPath(user.avatar))
                        .catch(() => {
                            throw { message: "Không thể xóa ảnh" }
                        })
                }
                let imageUrl = `${Math.floor(Math.random() * 101)}-${new Date().getTime()}.${image.extname}`
                await image.move(Helpers.publicPath(), {
                    name: userPath + imageUrl,
                    overwrite: true
                })
                    .catch(() => {
                        throw { message: "Không thể tải ảnh lên" }
                    })

                user.avatar = imageUrl

            }
            //  cập nhật role cho user
            if (no_role) {
                await user.roles().detach()
            }
            if ((role_ids || []).length) {
                await user.roles().detach()
                await user.roles().attach(role_ids)
            }
            //
            await user.save(trx)
            await trx.commit()
            let userJson = user.toJSON()
            userJson.roles = await user.roles().fetch()
            await this.clearCache()
            //
            return response.json({ success: true, data: userJson })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async destroy({ params, request, response }) {
        try {
            let { id } = params

            let { action, force } = request.all()
            let dataItem = await User.query()
                .withTrashed()
                .where("id", id)
                .first()
            if (!dataItem) {
                return response.json({ success: false, message: 'Thành viên không tồn tại.' })
            }

            if (action === "restore") {
                await dataItem.restore()
            } else {
                await dataItem.delete({ force })
                if (force) {
                    // Xóa ảnh thumbnail
                    if (dataItem.image) {
                        await Drive.delete(Helpers.publicPath(dataItem.image))
                            .catch(() => {
                                throw { message: "Không thể xóa ảnh" }
                            })
                    }

                }
            }
            await Cache.removeCache('users')
            return response.json({ success: true })

        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('users')
        ])
    }
}

module.exports = UserController
