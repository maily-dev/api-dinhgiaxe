'use strict'

const { default: slugify } = require("slugify")

const Cache = use('App/Helpers/Cache')
const PostCategory = use("App/Models/Admin/PostCategory")
const { slug } = use('App/Helpers/Utils')
const { POST_STATUS } = use("App/Helpers/Enum")

/**
 * Resourceful controller for interacting with postcategories
 */
class PostCategoryController {

    async index({ request, response }) {
        try {
            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            input.deleted = input.deleted || false

            const cacheName = 'postCategories'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                if (input.all) {
                    dataItem[key] = await PostCategory.query()
                        .fetch()
                } else {
                    dataItem[key] = await PostCategory.query()
                        .withTrashed()
                        .filter(input)
                        .paginate(input.page, input.rowsPerPage)
                }
            }
            await Cache.saveCache(cacheName, dataItem)

            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }


    async create({ request, response }) {
        try {
            let { name, color } = request.post()
            let slug = slugify(name)
            let checkSlug = await PostCategory.findBy({ slug })
            if (checkSlug) return response.json({ success: false, message: 'Loại tin đã tồn tại' })
            let postCategory = await PostCategory.create({
                name,
                slug: slug,
                image: color,
            })
            await Cache.removeCache('postCategories')
            return response.json({ success: true, data: postCategory })
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async update({ params, request, response }) {
        try {
            let { id } = params
            let postCategory = await PostCategory.find(id)
            //
            let { name, status, color } = request.post()
            postCategory.name = name
            postCategory.image = color
            postCategory.status = status

            await postCategory.save()
            await Cache.removeCache('postCategories')
            return response.json({ success: true, data: postCategory })
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async destroy({ params, request, response }) {
        try {
            let { id } = params

            let { action, force } = request.all()
            let postCategory = await PostCategory.query()
                .withTrashed()
                .where("id", id).first()

            if (postCategory) {
                if (action === "restore") {
                    await postCategory.restore()
                } else {
                    await postCategory.delete({ force })
                }
                await Cache.removeCache('postCategories')
                await Cache.removeCache('posts')
                response.json({ success: true })
            } else {
                response.json({ success: false, message: 'post not found.' })
            }
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }
}

module.exports = PostCategoryController
