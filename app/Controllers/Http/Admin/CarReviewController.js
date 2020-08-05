"use strict"

const CarReview = use("App/Models/Admin/CarReview")
const Cache = use('App/Helpers/Cache')
/**
 * Resourceful controller for interacting with ratings
 */
class CarReviewController {

    async index({ request, response }) {
        try {
            let input = request.get()
            //
            input.page = input.page ? parseInt(input.page) : 1
            input.rowsPerPage = input.rowsPerPage ? parseInt(input.rowsPerPage) : 10
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            //
            let dataCahe = await Cache.getCache('carReviews')
            let key = `admin-car-reviews-${JSON.stringify(input)}` // key lấy data
            dataCahe = dataCahe || {}
            if (!dataCahe[key]) {
                dataCahe[key] = await CarReview.query()
                    .filter(input)
                    .with('car', q => q.select('id', 'name', 'year', 'image')) // thông tin xe
                    .with('by', q => q.withTrashed().select('id', 'name', 'email', 'phone', 'avatar'))
                    .with('carResultHistory') // kết quả định giá lúc review
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache('carReviews', dataCahe)
            //
            return response.json({ success: true, data: dataCahe[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    async update({ params, request, response }) {
        try {
            let { id } = params
            let data = await CarReview.find(id)
            //
            let { status, content, rate } = request.post()
            data.content = content
            data.rate = rate
            data.status = status

            await data.save()
            await this.clearCache()
            return response.json({ success: true, data })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async destroy({ params, request, response, auth }) { // xóa cứng
        try {
            let { id } = params
            let data = await CarReview.find(id)
            if (!data) return response.json({ success: true, message: 'Đánh giá không tồn tại' })
            await data.delete()
            await this.clearCache()
            return response.json({ success: true, message: 'Đã xóa' })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }

    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('carReviews'),
            Cache.removeCache('carResultHistories')
        ])
    }
}

module.exports = CarReviewController
