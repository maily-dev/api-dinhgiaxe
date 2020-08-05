'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const PostComment = use("App/Models/PostComment")
const Cache = use('App/Helpers/Cache')
const { COMMENT_STATUS } = use("App/Helpers/Enum")
/**
 * Resourceful controller for interacting with postComments
 */
class CommentController {
    /**
     * Show a list of all postComments.
     * GET postComments
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response, params }) { // lấy danh sách comment theo bài viết hoặc xem trả lời comment
        try {
            let { post_id } = params
            //
            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            input.postId = post_id
            input.parentId = input.parent_id || "null"
            input.status = COMMENT_STATUS.ACTIVED

            const cacheName = 'postComments'
            let dataItem = await Cache.getCache(cacheName)
            const key = `client-${JSON.stringify(input)}` // key lấy data


            if (!dataItem[key]) {
                dataItem[key] = await PostComment.query()
                    .filter(input)
                    .with('by', (builder) => {
                        builder.setVisible(['name', 'avatar'])
                    })
                    .withCount("children")
                    .paginate(input.page, input.rowsPerPage)
                //
                // tính số comment trả lời
                // cahe[key] = cahe[key].toJSON()

                // if (!input.parentId) {
                //     cahe[key].count = await PostComment.query()
                //         .where("post_id", input.postId)
                //         .where("status", input.status)
                //         .getCount()
                // }
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
     * GET postComments/create
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async create({ request, response, auth }) {
        try {
            let { content, post_id, parent_id } = request.post()
            let user_id = auth.user.id
            let comment = await PostComment.create({
                post_id,
                content,
                parent_id: parent_id || null,
                user_id,
                status: COMMENT_STATUS.ACTIVED
            })
            await this.clearCache()
            return response.json({ success: true, data: comment })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    /**
     * Display a single comment.
     * GET postComments/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async getReplies({ params, request, response, view }) { // xem trả lời comment
        try {
            let { id } = params
            let { page, rowsPerPage, } = request.get()
            page = page ? parseInt(page) : 1
            rowsPerPage = rowsPerPage ? parseInt(rowsPerPage) : 10
            let postComments = await PostComment.query()
                .where({ parent_id: id })
                .where({ status: COMMENT_STATUS.ACTIVED })
                .paginate(page, rowsPerPage)
            //
            return response.json({ success: true, data: postComments })
        } catch (error) {
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }

    }

    /**
     * Update comment details.
     * PUT or PATCH postComments/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params, request, response, auth }) {
        try {
            let { id } = params
            let { content } = request.post()
            let user_id = auth.user.id
            let comment = await PostComment.query().where({ id }).where({ user_id }).first()
            if (!comment) return response.status(422).json({ success: false, message: 'Bình luận không tồn tại' })
            comment.content = content
            await comment.save()
            await this.clearCache()
            return response.json({ success: true, data: comment })
        } catch (error) {
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }

    /**
     * Delete a comment with id.
     * DELETE postComments/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response, auth }) {
        try {
            let { id } = params
            let user_id = auth.user.id
            let comment = await PostComment.query().where({ id }).where({ user_id }).first()
            if (!comment) return response.status(422).json({ success: false, message: 'Bình luận không tồn tại' })
            await comment.delete()
            await this.clearCache()
            return response.json({ success: true, message: 'Đã xóa' })
        } catch (error) {
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }

    }

    async clearCache() {
        await Promise.all([
            Cache.removeCache('postComments'),
            Cache.removeCache('posts')
        ])
    }
}

module.exports = CommentController
