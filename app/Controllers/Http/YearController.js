"use strict"
const Car = use("App/Models/Car")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with carattributes
 */
class YearController {
    async index({ request, response }) { // lấy danh sách năm theo model slug
        try {
            let { brand_slug, model_slug } = request.get()

            const cacheName = 'cars'
            let dataItem = await Cache.getCache(cacheName)
            const key = `client-getYears-${brand_slug}-${model_slug}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await Car.query()
                    .whereHas('attribute', builder => {
                        builder.whereHas('model', builder => {
                            builder.where({ slug: model_slug })
                                .whereHas('brand', builder => {
                                    builder.where({ slug: brand_slug })
                                })
                        })
                    })
                    .groupBy('year')
                    .fetch()
                dataItem[key] = dataItem[key].toJSON()
                dataItem[key] = dataItem[key].map(item => item.year)
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Có lỗi' })
        }
    }
}

module.exports = YearController
