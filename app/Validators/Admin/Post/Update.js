'use strict'
const { POST_STATUS } = use("App/Helpers/Enum")
class Update {
    get rules() {
        return {
            title: "required",
            content: "required",
            slug: "required|exists:posts,slug",
            image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream',
            post_category_slug: "required|exists:post_categories,slug",
            status: `required|in:${POST_STATUS.IN_ACTIVE},${POST_STATUS.ACTIVED},${POST_STATUS.DELETED}`,
        }
    }

    get sanitizationRules() {
        return {
            title: "trim",
            content: "trim",
            slug: "trim",
            post_category_slug: "trim",
            status: "trim",
        }
    }

    get messages() {
        return {
            "title.required": "Tiêu đề không được trống",
            "content.required": "Nội dung không được trống",
            "slug.exists": "Tin không tồn tại",
            "post_category_slug.required": "Loại tin không được trống",
            "post_category_slug.exists": "Loại tin không tồn tại",
            "status.required": "Status không được trống",
            "status.in": "Status không đúng",
        }
    }
    get data() {
        const requestBody = this.ctx.request.all()
        const slug = this.ctx.request.params.slug
        return Object.assign({}, requestBody, { slug })
    }
}

module.exports = Update
