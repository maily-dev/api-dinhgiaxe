'use strict'
const Post = use("App/Models/Admin/Post")
const Helpers = use('Helpers')
const utils = use('App/Helpers/Utils')
const Cache = use('App/Helpers/Cache')
const Drive = use('Drive')
const { POST_STATUS } = use("App/Helpers/Enum")
const Database = use('Database')
const Config = use("Config")
const SeoController = use("App/Controllers/Http/SeoController")

//
var fs = require('fs')
var https = require('https')
const domain = Config.get(`drive.disks.domain`, null)
const postPath = Config.get(`drive.disks.images.post`, null)
//
/**
 * Resourceful controller for interacting with posts
 */
class PostController {

    async index({ request, response, auth }) {
        try {

            let input = request.get()

            input.page = Math.abs(parseInt(input.page) || 1)
            input.rowsPerPage = Math.abs(parseInt(input.rowsPerPage) || 10)
            input.sortBy = input.sortBy || 'created_at'
            input.sort = input.sort || 'desc'
            input.deleted = input.deleted || false
            input.postCategoryId = input.post_category_id

            const cacheName = 'posts'
            let dataItem = await Cache.getCache(cacheName)
            const key = `admin-${JSON.stringify(input)}`

            if (!dataItem[key]) {
                dataItem[key] = await Post.query()
                    .withTrashed()
                    .filter(input)
                    .with('by')
                    .with('category')
                    .paginate(input.page, input.rowsPerPage)
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }
    async show({ params, response }) {
        try {
            let { slug } = params
            let post = await Post.query()
                .withTrashed()
                .where({ slug })
                .with('by', builder => builder.setVisible(["name", "email", "avatar"]))
                .with('category', builder => builder.setVisible(["id", "slug", "name", "image"]))
                .first()
            //
            if (post) return response.json({ success: true, data: post })
            else return response.status(404).json({ success: false, message: 'Không tìm thấy' })
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
            let { slug } = params

            let { action, force } = request.all()
            let post = await Post.query()
                .withTrashed()
                .where("slug", slug)
                .first()

            if (post) {
                if (action === "restore") {
                    await post.restore()
                } else {
                    await post.delete({ force })
                    if (force) {
                        // Xóa ảnh thumbnail
                        if (post.image) {
                            await Drive.delete(Helpers.publicPath(post.image))
                                .catch(() => {
                                    throw { message: "Không thể xóa ảnh" }
                                })
                        }
                        // Kiểm tra ảnh trong content để xóa ảnh
                        let imagesDeleted = this.getAttrFromString(post.content, 'img', 'src')
                        //
                        if (imagesDeleted && imagesDeleted.length > 0) {
                            for (const fileUrl of imagesDeleted) {
                                await Drive.delete(Helpers.publicPath(fileUrl.replace(`${domain}${postPath}`, "")))
                                    .catch(() => {
                                        throw { message: "Không thể xóa ảnh" }
                                    })
                            }
                        }
                    }
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
    getAttrFromString(str, node, attr) {
        var regex = new RegExp('<' + node + ' .*?' + attr + '="(.*?)"', "gi"), result, res = []
        while ((result = regex.exec(str))) {
            res.push(result[1])
        }
        return res
    }
}

module.exports = PostController
