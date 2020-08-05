'use strict'
const CarType = use("App/Models/CarType")
const Cache = use('App/Helpers/Cache')
const CarAttribute = use("App/Models/CarAttribute")
class CarTypeController {

    async getAll({ request, response }) {
        const cacheName = 'carTypes'
        let dataItem = await Cache.getCache(cacheName)
        const key = `client-all-car-type` // key lấy data

        if (!dataItem[key]) {
            dataItem[key] = await CarType.fetch()
        }
        await Cache.saveCache(cacheName, dataItem)
        return response.json({ success: true, data: dataItem[key] })
    }

    async index({ request, response }) { // lấy loại xe theo hãng, dòng, năm xe ( kết quả = suv, sedan...)
        try {
            let { brand_slug, model_slug, year } = request.get()

            const cacheName = 'carTypes'
            let dataItem = await Cache.getCache(cacheName)
            const key = `client-car-type-by-${brand_slug}-${model_slug}-${year}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await CarType.query()
                    .whereHas('attributes', builder => {
                        builder.whereHas('model', builder => {
                            builder.where({ slug: model_slug }).whereHas('brand', builder => {
                                builder.where({ slug: brand_slug })
                            })
                        })
                            .whereHas('cars', builder => {
                                builder.where({ year })
                            })

                    })

                    .select('name', 'slug')
                    .fetch()
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }

    }
}

module.exports = CarTypeController
