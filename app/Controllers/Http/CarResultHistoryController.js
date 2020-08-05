"use strict"

const CarResultHistory = use("App/Models/CarResultHistory")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with userhistories
 */
class CarResultHistoryController {

    async index({ request, response, auth }) { // lấy danh sách các xe mà user đã định giá 
        try {
            let input = request.get()

            input.userId = auth.user.id
            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'

            const cacheName = 'carResultHistories'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-carResultHistories-${JSON.stringify(input)}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await CarResultHistory.query()
                    .with('car', builder => {
                        builder.select('id', 'attribute_id', 'name', 'year', 'image')
                            .with('attribute', builder => {
                                builder.select('id', 'name')
                            })
                    })
                    .filter(input)
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache(cacheName, dataItem)
            //
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async show({ params, request, response, view }) {
        let { id } = params
        try {
            let data = await CarResultHistory.with("car", builder => builder.select('id', 'name', 'image')).find(id)

            return response.json({ success: true, data })
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async destroy({ params, request, response, auth }) {
        let { id } = params
        let user_id = auth.user.id
        try {
            let carResultHistory = await CarResultHistory.query().where({ id }).where({ user_id })
            if (!carResultHistory) return response.status(422).json({ success: false, data: "Không tồn tại!" })
            //
            await carResultHistory.delete()
            await this.clearCache()
            //
            return response.json({ success: true, data: "Đã xóa!" })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('carReviews'),
            Cache.removeCache('carResultHistories')
        ])
    }

}

module.exports = CarResultHistoryController
