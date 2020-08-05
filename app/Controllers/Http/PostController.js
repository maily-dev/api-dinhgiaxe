'use strict'
const Post = use("App/Models/Post")
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

    async index({ request, response }) {
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
            const key = `client-${JSON.stringify(input)}` // key lấy data

            if (!dataItem[key]) {
                dataItem[key] = await Post.query()
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
    async primaryPosts({ request, response, auth }) {
        try {

            let cache = await Cache.getCache('posts')
            let key = `client-posts-primary` // key lấy data

            if (!cache[key]) {
                cache[key] = await Post.query()
                    .with('by', q => q.select("id", "name", "email"))
                    .with('category')
                    .orderBy("primary_index").limit("5").fetch()


            }
            await Cache.saveCache('posts', cache)
            return response.json({ success: true, data: cache[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: true, message: 'Lỗi trong quá trình xử lý' })
        }
    }


    async create({ request, response, auth }) {
        const trx = await Database.beginTransaction()
        const {
            title,
            content,
            description,
            post_category_id,
            primary_index,
            resource_id
        } = request.post()
        const image = request.file('image', {
            types: ['image'],
            size: '2mb'
        })

        try {
            // Lấy post slug
            const slug = await utils.renderPostSlug(title)
            // Lấy Người tạo bài
            const user_id = auth.user.id
            // Tạo bài viết
            const post = await Post.create({
                title,
                content,
                description: description || "",
                slug,
                user_id,
                post_category_id,
                primary_index: (primary_index ? parseInt(primary_index) : null) || null,
                resource_id,
                status: POST_STATUS.IN_ACTIVE
            }, trx)
            // Thêm hình ảnh vào disk
            if (image) {
                // Ghi Logo vào image
                await (new SeoController()).formatImage(image.tmpPath, 800)

                const imageUrl = `${post.resource_id}_${new Date().getTime()}.jpg`
                await image.move(Helpers.publicPath(), {
                    name: postPath + imageUrl,
                    overwrite: true
                }).catch(() => {
                    throw { message: "Không thể tải ảnh lên" }
                })
                post.image = imageUrl
                await post.save(trx)
            }
            // Xóa các cache post hiện tại
            await this.clearCache('posts')
            await this.clearCache('postCategories')
            await trx.commit()

            return response.json({ success: true, data: post })
        } catch (error) {
            await trx.rollback()
            return response.status(500).json({
                success: false,
                message: "Có lỗi",
                error: error
            })
        }
    }

    async show({ params, response }) {
        try {
            let { slug } = params
            let post = await Post.query()
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
    async update({ params, request, response }) {
        const trx = await Database.beginTransaction()
        let { slug } = params
        try {
            let post = await Post.findBy("slug", slug)
            const postContent = post.content
            //
            let { title, content, description, post_category_id, primary_index, status } = request.post()
            post.title = title
            post.content = content
            post.description = description || ""
            post.post_category_id = post_category_id
            post.primary_index = (primary_index ? parseInt(primary_index) : null) || null
            post.status = status

            let image = request.file('image')

            if (image) {
                if (post.image) {
                    await Drive.delete(Helpers.publicPath(post.image))
                        .catch(() => {
                            throw { message: "Không thể xóa ảnh" }
                        })
                }
                //
                // Ghi Logo vào image
                await (new SeoController()).formatImage(image.tmpPath, 800)
                //
                const imageUrl = `${post.resource_id}_${new Date().getTime()}.jpg`
                await image.move(Helpers.publicPath(), {
                    name: postPath + imageUrl,
                    overwrite: true
                }).catch(() => {
                    throw { message: "Không thể tải ảnh lên" }
                })
                post.image = imageUrl
            }
            // Kiểm tra ảnh trong content để xóa ảnh không cần thiết
            let imagesOld = this.getAttrFromString(postContent, 'img', 'src')
            let imagesNew = this.getAttrFromString(content, 'img', 'src')
            let imagesDeleted = imagesOld.filter(item => !imagesNew.includes(item))
            //
            if (imagesDeleted && imagesDeleted.length > 0) {
                for (const fileUrl of imagesDeleted) {
                    await Drive.delete(Helpers.publicPath(fileUrl.replace(`${domain}${postPath}`, "")))
                        .catch(() => {
                            throw { message: "Không thể xóa ảnh" }
                        })
                }
            }
            //
            await post.save(trx)
            await this.clearCache('posts')
            await this.clearCache('postCategories')
            await trx.commit()

            return response.json({ success: true, data: post })
            //
        } catch (error) {
            console.log(error)
            await trx.rollback()
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }
    async uploadImage({ params, request, response }) {
        let { resource_id } = request.post()
        try {
            let image = request.file('image')
            if (image) {
                await (new SeoController()).formatImage(image.tmpPath, 800)
                //
                const imageUrl = `${postPath}${resource_id}_${new Date().getTime()}.jpg`
                await image.move(Helpers.publicPath(), {
                    name: imageUrl,
                    overwrite: true
                }).catch(() => {
                    throw { message: "Không thể tải ảnh lên" }
                })
                //
                await Cache.removeCache('postCategories')
                await Cache.removeCache('posts')

                return response.json({
                    success: 1,
                    data: `${domain}${imageUrl}`
                })
            }
            //
        } catch (error) {
            console.log(error)
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }
    async uploadImageByUrl({ params, request, response }) {
        const { url, resource_id } = request.post()
        try {
            if (url) {
                const imageUrl = `${postPath}${resource_id}_${new Date().getTime()}.jpg`
                //
                let fileUrl = Helpers.publicPath() + imageUrl
                //
                var file = fs.createWriteStream(fileUrl)
                await new Promise(function (resolve, reject) {
                    https.get(url, function (res) {
                        //
                        res.pipe(file)
                        //
                        file.on('finish', async () => {
                            await (new SeoController()).formatImage(fileUrl, 800)
                            resolve()
                        })
                    }).on('error', (e) => {
                        reject(e)
                    })
                })
                await Cache.removeCache('postCategories')
                await Cache.removeCache('posts')
                return response.json({
                    success: 1,
                    data: `${domain}${imageUrl}`
                })

            }
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
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async updateStatus({ params, request, response }) {
        try {
            let { slug } = params
            let action = request.input('action')
            let post = await Post.where({ slug }).first()
            //
            if (!post) return response.status(404).json({ success: false, message: 'Không tìm thấy' })
            else {
                await Cache.removeCache('postCategories')
                await Cache.removeCache('posts')
            }

            if (action == POST_STATUS.ACTIVED) {
                post.status = POST_STATUS.ACTIVED
                await post.save()
                return response.json({ success: true, message: 'Active thành công' })
            }
            else if (action == POST_STATUS.IN_ACTIVE) {
                post.status = POST_STATUS.IN_ACTIVE
                await post.save()
                return response.json({ success: true, message: 'In-active thành công' })
            }
            else if (action == POST_STATUS.DELETED) {
                post.status = POST_STATUS.DELETED
                await post.save()
                return response.json({ success: true, message: 'Xóa thành công' })
            }
            //
        } catch (error) {
            return response.status(500).json({
                success: false,
                message: "Có lỗi"
            })
        }
    }

    async clearCache(name) {
        await Cache.removeCache(name)
    }
    async getCache(name, key) {
        let cache = await Cache.getCache(name)
        if (!key) return cache
        cache = cache || {}
        return cache[key]
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
