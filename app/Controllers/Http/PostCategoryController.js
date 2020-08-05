'use strict'

const { POST_STATUS } = use("App/Helpers/Enum")
const Helpers = use('Helpers')
const PostCategory = use("App/Models/PostCategory")
const Drive = use('Drive')
const { slug } = use('App/Helpers/Utils')
const CacheManager = use('App/Helpers/CacheManager')
const Cache = use('App/Helpers/Cache')
class PostCategoryController {

    async index({ response }) {
        try {
            const key = "client-categories-index"
            const cacheName = "postCategories"
            let dataItem = await Cache.getCache(cacheName)
            //
            if (!dataItem[key]) {
                dataItem[key] = await PostCategory.query()
                    .whereHas('posts', (builder) => {
                        builder.where('status', POST_STATUS.IN_ACTIVE)
                    })
                    .orderBy('primary_index')
                    .fetch()
            }
            await Cache.saveCache(cacheName, dataItem)
            return response.json({ success: true, data: dataItem[key] })
        } catch (error) {
            console.log(error)
            return response.status(500).json({ success: false, message: 'Lỗi trong quá trình xử lý' })
        }
    }


}

module.exports = PostCategoryController
