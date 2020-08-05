'use strict'

const CarBrand = use("App/Models/CarBrand")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with carbrands
 */
class CarBrandController {
    /**
     * Show a list of all carbrands.
     * GET carbrands
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response }) {
        const cacheName = 'brands'
        let dataItem = await Cache.getCache(cacheName)
        const key = `client`

        if (!dataItem[key]) {
            dataItem[key] = await CarBrand.query().fetch()
        }
        await Cache.saveCache(cacheName, dataItem)
        return response.json({ success: true, data: dataItem[key] })
    }

}

module.exports = CarBrandController
