"use strict"

const CarModel = use("App/Models/Admin/CarModel")
const CarBrand = use("App/Models/CarBrand")
const Cache = use('App/Helpers/Cache')
const CustomException = use('App/Exceptions/Handler')
/**
 * Resourceful controller for interacting with carclasses
 */
class CarModelController {
    /**
     * Show a list of all carclasses.
     * GET carclasses
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
            input.brandId = input.brand_id

            const cacheName = 'models'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                if (input.all) {
                    dataItem[key] = await CarModel.query()
                        .filter(input)
                        .with("brand", q => q.select("id", "name"))
                        .fetch()
                } else {
                    dataItem[key] = await CarModel.query()
                        .filter(input)
                        .with("brand", q => q.select("id", "name"))
                        .paginate(input.page, input.rowsPerPage)
                }
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }

    }

    async create({ params, request, response }) {

        try {
            let { brand_id, name } = request.post()
            let model = await CarModel.create({
                name,
                brand_id
            })
            await this.clearCache()
            return response.json({ success: true, data: model })
        } catch (error) {
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }
    }

    async update({ params, request, response }) {
        let { id } = params
        try {
            let { brand_id, name } = request.post()
            let data = await CarModel.findOrFail(id)
            data.name = name
            data.brand_id = brand_id
            await data.save()
            await this.clearCache()
            return response.json({ success: true, data })
        } catch (error) {
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }
    /**
     * Delete a carclass with id.
     * DELETE carclasses/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response }) {
        const { id } = params
        try {
            let data = await CarModel.findOrFail(id)
            await data.delete()
            await this.clearCache()
            return response.json({ success: true, message: "Đã xóa!" })
        } catch (error) {
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    // Clear Cache Function
    async clearCache() {
        await Promise.all([
            Cache.removeCache('brands'),
            Cache.removeCache('carCrawls'),
            Cache.removeCache('models'),
            Cache.removeCache('attributes')
        ])
    }
}

module.exports = CarModelController
