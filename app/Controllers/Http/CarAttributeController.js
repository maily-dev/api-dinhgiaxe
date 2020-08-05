"use strict"

const CarAttribute = use("App/Models/CarAttribute")
const CarModel = use("App/Models/CarModel")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with carattributes
 */
class CarAttributeController {
    /**
     * Show a list of all carattributes.
     * GET carattributes
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response }) { // lấy thuộc tính theo brand, model, car type, year
        let { brand_slug, model_slug, car_type_slug, year } = request.get()

        const cacheName = 'attributes'
        try {
            let dataItem = await Cache.getCache(cacheName)
            const key = `client-${brand_slug}-${model_slug}-${car_type_slug}-${year}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await CarAttribute.query()
                    .whereHas('cars', builder => {
                        builder.where({ year })
                    })
                    .whereHas('carType', builder => {
                        builder.where({ slug: car_type_slug })
                    })
                    .whereHas('model', builder => {
                        builder.where({ slug: model_slug })
                            .whereHas('brand', builder => {
                                builder.where({ slug: brand_slug })
                            })
                    })
                    .with('carType', builder => builder.select('id', 'name', 'slug')
                    )
                    .with('model', builder => {
                        builder.select('id', 'name', 'slug', 'brand_id').setVisible(['name', 'slug'])
                            .with("brand", q => q.select('id', 'name', 'slug').setVisible(['name', 'slug']))
                    }
                    )
                    .select('id', 'name', 'slug', 'car_type_id', 'model_id', 'name')
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

module.exports = CarAttributeController
