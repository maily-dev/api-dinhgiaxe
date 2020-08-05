"use strict"

const Helpers = use('Helpers')
const Cache = use('App/Helpers/Cache')
const CarAttribute = use("App/Models/Admin/CarAttribute")
//
const Drive = use('Drive')
const Database = use('Database')
/**
 * Resourceful controller for interacting with carattributes
 */
class CarAttributeController {

    async index({ request, response }) { // lấy danh sách thuộc tính, lọc được theo modelID, brandID, carTypeID
        try {
            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            input.brandId = input.brand_id
            input.modelId = input.model_id

            const cacheName = 'attributes'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                dataItem[key] = await CarAttribute.query()
                    .filter(input)
                    .with("model", q => q.select("id", "name", "brand_id")
                        .with("brand", sq => sq.select("id", "name")
                        )
                    )
                    .with("type", q => q.select("id", "name"))
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }

    }

    async create({ request, response }) {
        const trx = await Database.beginTransaction()
        try {
            let { model_id, car_type_id, name } = request.post()
            let attribute = await CarAttribute.create({
                model_id,
                car_type_id,
                name,
                author_site: 'created by admin'
            }, trx)
            await trx.commit()
            await this.clearCache()
            return response.json({ success: true, data: attribute })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async update({ params, request, response }) {
        const trx = await Database.beginTransaction()
        let { id } = params
        let { model_id, car_type_id, name } = request.post()
        try {
            let data = await CarAttribute.findOrFail(id)
            data.model_id = model_id
            data.car_type_id = car_type_id
            data.name = name
            await data.save(trx)
            await trx.commit()
            await this.clearCache()
            //
            return response.json({ success: true, data })
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async destroy({ params, request, response }) {
        const { id } = params
        try {
            let data = await CarAttribute.findOrFail(id)
            await data.delete()
            await this.clearCache()
            return response.json({ success: true, data: "Đã xóa!" })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('carCrawls'),
            Cache.removeCache('models'),
            Cache.removeCache('attributes')
        ])
    }

}

module.exports = CarAttributeController
