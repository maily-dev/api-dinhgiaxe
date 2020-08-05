"use strict"

const CarReview = use("App/Models/CarReview")
const Cache = use('App/Helpers/Cache')
const { COMMENT_STATUS } = use("App/Helpers/Enum")
/**
 * Resourceful controller for interacting with ratings
 */
class CarReviewController {
    async index({ request, response }) { // xem các đánh giá cho 1 loại xe
        try {
            let { car_slug, page, rowsPerPage, sortBy, sort } = request.get()

            let carReviewCache = await Cache.getCache('carReviews')
            page = page ? parseInt(page) : 1
            rowsPerPage = rowsPerPage ? parseInt(rowsPerPage) : 10
            sortBy = sortBy || 'created_at'
            sort = sort || 'desc'
            const key = `client-carReview-${car_slug}-${page}-${rowsPerPage}-${sortBy}-${sort}` // key lấy data

            if (!carReviewCache[key]) {
                carReviewCache[key] = await CarReview.query()
                    .whereHas('car', builder => builder.where({ slug: car_slug }))
                    .with('carResultHistory', builder => {
                        builder.select('id', 'mileage', 'min', 'max', 'condition', 'created_at')
                    })
                    .with('car', builder => {
                        builder.select('id', 'attribute_id', 'year', 'name')
                    })
                    .with('user', builder => {
                        builder.select('id', 'name', 'avatar')
                    })
                    .setHidden(['status'])
                    .orderBy(`${sortBy}`, `${sort}`)
                    .paginate(page, rowsPerPage)
            }
            await Cache.saveCache('carReviews', carReviewCache)
            return response.json({ success: true, data: carReviewCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    async statistic({ request, response }) {
        try {
            let { car_slug } = request.get()
            let carReviewCache = await Cache.getCache('carReviews')
            let key = `client-review-statistic-${car_slug}` // key lấy data
            carReviewCache = carReviewCache || {}
            if (!carReviewCache[key]) {
                let reviews = await CarReview.query()
                    .whereHas('car', builder => {
                        builder.where({ slug: car_slug })
                    })
                    .pluck("rate")
                carReviewCache[key] = {
                    count: reviews.length,
                    rate: reviews.reduce((total, rate) => total + rate, 0) / reviews.length
                }
            }
            await Cache.saveCache('carReviews', carReviewCache)
            return response.json({ success: true, data: carReviewCache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }

    }

    // Kiểm tra xem user đã review
    async getReviewByUser({ request, response, auth }) {
        try {
            let user_id = auth.user.id
            let reviews = await CarReview.query()
                .where({ user_id })
                .with('car', builder => {
                    builder.select('id', 'name', 'image', 'year', 'slug')
                })
                .with('carResultHistory', builder => {
                    builder.select('id', 'mileage', 'min', 'max', 'condition', 'created_at')
                })
                .fetch()
            //
            return response.json({ success: true, data: reviews })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }

    }
    /**
     * Render a form to be used for creating a new rating.
     * GET ratings/create
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async create({ request, response, auth }) {
        try {
            let { car_id, car_result_history_id, rate, content } = request.post()
            let user_id = auth.user.id
            let review = await CarReview.create({
                car_id,
                car_result_history_id,
                rate,
                content,
                user_id,
                status: COMMENT_STATUS.ACTIVED
            })
            await Cache.removeCache('carReviews')
            return response.json({ success: true, data: review })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }

    /**
     * Update rating details.
     * PUT or PATCH ratings/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params, request, response, auth }) {
        try {
            let { id } = params
            let user_id = auth.user.id
            let { rate, content } = request.post()
            let review = await CarReview.query().where({ id }).where({ user_id }).first()
            if (!review) return response.status(422).json({ success: false, message: 'Đánh giá không tồn tại' })
            review.rate = rate
            review.content = content
            await review.save()
            await Cache.removeCache('carReviews')
            //
            return response.json({ success: true, data: review })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi hoặc ID không đúng" })
        }
    }

    /**
     * Delete a rating with id.
     * DELETE ratings/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response, auth }) {
        try {
            let { id } = params
            let user_id = auth.user.id
            let review = await CarReview.query().where({ id }).where({ user_id }).first()
            //
            if (!review) return response.status(422).json({ success: false, message: "ID không tồn tại" })
            return response.json({ success: true, message: 'Đã xóa' })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: "Có lỗi" })
        }
    }
}

module.exports = CarReviewController
