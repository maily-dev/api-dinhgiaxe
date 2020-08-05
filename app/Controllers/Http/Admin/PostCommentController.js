'use strict'

const Comment = use("App/Models/Admin/PostComment")
const Cache = use('App/Helpers/Cache')
const { COMMENT_STATUS } = use("App/Helpers/Enum")
/**
 * Resourceful controller for interacting with comments
 */
class CommentController {

    async index({ request, response }) {
        try {
            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            //
            const cacheName = 'postComments'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await Comment.query()
                    .filter(input)
                    .with("by")
                    .with("post", q => q.withTrashed().select("slug", "title", "id", "deleted_at"))
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache(cacheName, dataItem)

            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    /**
     * Render a form to be used for creating a new comment.
     * GET comments/create
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async create({ request, response, auth }) {
    }

    /**
     * Create/save a new comment.
     * POST comments
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async store({ request, response }) {
    }

    /**
     * Render a form to update an existing comment.
     * GET comments/:id/edit
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async edit({ params, request, response, view }) {

    }

    /**
     * Update comment details.
     * PUT or PATCH comments/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params, request, response }) {
        try {
            let { id } = params
            let dataItem = await Comment.find(id)
            //
            let { status } = request.post()
            dataItem.status = status

            await dataItem.save()
            await Cache.removeCache('postComments')
            return response.json({ success: true, data: dataItem })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    /**
     * Delete a comment with id.
     * DELETE comments/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response, auth }) { // xóa cứng
        try {
            let { id } = params
            let comment = await Comment.find(id)
            if (!comment) return response.json({ success: true, message: 'Bình luận không tồn tại' })
            await comment.delete()
            await Cache.removeCache('postComments')
            await Cache.removeCache('posts')
            return response.json({ success: true, message: 'Đã xóa' })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }

    }

}

module.exports = CommentController
