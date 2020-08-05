'use strict'
const Permission = use("Adonis/Acl/Permission")
const { slug } = use('App/Helpers/Utils')
const Cache = use('App/Helpers/Cache')
class PermissonController {
    async index({ request, response, view }) {
        try {
            let permissonCache = await Cache.getCache('permissons')
            let key = `admin-permissons` // key lấy data
            permissonCache = permissonCache || {}
            if (!permissonCache[key]) {
                permissonCache[key] = await Permission.query().fetch()
            }
            await Cache.saveCache('permissons', permissonCache)
            return response.json({ success: true, data: permissonCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }
}

module.exports = PermissonController
