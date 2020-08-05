"use strict"

const CarCrawl = use("App/Models/CarCrawl")
const Attribute = use("App/Models/CarAttribute")
const CarBrand = use("App/Models/CarBrand")
const CarModel = use("App/Models/CarModel")
const Cache = use('App/Helpers/Cache')
const { SITES_CRAWL, CAR_STATUS } = use("App/Helpers/Enum")

/**
 * Resourceful controller for interacting with cars
 */
class CarCrawlController {
    /**
     * Show a list of all cars.
     * GET cars
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response }) { // danh sách xe đã crawl về, lọc theo brandID, modelID, carTypeID
        try {
            let input = request.get()
            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'

            let carCrawlCache = await Cache.getCache('carCrawls')
            let key = `admin-carCrawls-${JSON.stringify(input)}` // key lấy data
            carCrawlCache = carCrawlCache || {}
            if (!carCrawlCache[key]) {
                carCrawlCache[key] = await CarCrawl.query()
                    .filter(iput)
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache('carCrawls', carCrawlCache)
            return response.json({ success: true, data: carCrawlCache[key] })
        } catch (error) {
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }
}

module.exports = CarCrawlController
