'use strict'

class Comment {
    get rules() {
        return {
            content: "required",
            post_slug: "required|exists:06_02_posts,slug",
        }
    }

    get sanitizationRules() {
        return {
            content: "trim",
        }
    }

    get messages() {
        return {
            "content.required": "Nội dung không được trống",
            "post_slug.required": "Slug bài viết không được trống",
            "post_slug.exists": "Slug bài viết không đúng",
        }
    }
}

module.exports = Comment
