'use strict'
const CarStepPrice = use("App/Models/CarStepPrice")
class CarStepPriceController {
    async getStepPriceByAttribute({ params, request, response }) { // danh sách bước giá theo attribute_id các năm
        const { id } = params
        let data = await CarStepPrice.query().where({ attribute_id: id })
            .fetch()
        return response.json({
            success: true, data
        })
    }
}

module.exports = CarStepPriceController
