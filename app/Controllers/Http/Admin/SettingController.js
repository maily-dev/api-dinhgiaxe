'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Setting = use("App/Models/Setting")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with settings
 */
class SettingController {
    async index({ request, response, view }) {
        try {
            let { keyword, page, rowsPerPage, sortBy, sort } = request.get()
            let settingCache = await Cache.getCache('settings')
            page = page ? parseInt(page) : 1
            rowsPerPage = rowsPerPage ? parseInt(rowsPerPage) : 10
            sortBy = sortBy || 'created_at'
            sort = sort || 'desc'
            let key = `admin-settings-${keyword}-${page}-${rowsPerPage}-${sortBy}-${sort}` // key lấy data
            settingCache = settingCache || {}
            if (!settingCache[key]) {
                settingCache[key] = await Setting.query()
                    .orderBy(`${sortBy}`, `${sort}`)
                    .filter({ keyword })  // tên biến truyền vào fillter không được gạch dưới
                    .paginate(page, rowsPerPage)
            }
            await Cache.saveCache('settings', settingCache)
            return response.json({ success: true, data: settingCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    async create({ request, response, view }) {
        try {
            let { key, value, name, detail } = request.post()
            let setting = await Setting.create({
                key,
                value,
                name,
                detail
            })
            await this.clearCache()
            return response.json({ success: true, data: setting })
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
            let { id } = params
            let setting = await Setting.find(id)
            //
            if (setting) return response.json({ success: true, data: setting })
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
            let { id } = params
            let setting = await Setting.findOrFail(id)
            //
            let { key, value, detail } = request.post()
            setting.key = key
            setting.value = value
            setting.name = name
            setting.detail = detail
            await setting.save()
            await this.clearCache()
            return response.json({ success: true, data: setting })
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
            let { id } = params
            let setting = await Setting.find(id)
            //
            if (setting) {
                await setting.delete()
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
            Cache.removeCache('settings')
        ])
    }
}

module.exports = SettingController
