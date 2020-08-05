"use strict"

const CarModel = use("App/Models/CarModel")
const CarAttribute = use("App/Models/CarAttribute")
const Cache = use('App/Helpers/Cache')
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
        let { brand_slug } = request.get()
        const cacheName = 'models'
        let dataItem = await Cache.getCache(cacheName)
        const key = `client-${brand_slug}` // key lấy data

        if (!dataItem[key]) {
            dataItem[key] = await CarModel.query()
                .whereHas('brand', builder => builder.where({ slug: brand_slug }))
                .whereHas('attributes', builder => {
                    builder.whereHas('cars')
                })
                .select('name', 'slug')
                .fetch()
        }
        await Cache.saveCache(cacheName, dataItem)
        return response.json({ success: true, data: dataItem[key] })
    }

}

module.exports = CarModelController
