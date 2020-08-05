'use strict'

class Create {
  get rules() {
    return {
      title: "required",
      content: "required",
      post_category_id: "required",
      image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream'
    }
  }

  get sanitizationRules() {
    return {
      title: "trim",
      content: "trim",
      post_category_id: "trim",
    }
  }

  get messages() {
    return {
      "title.required": "Tiêu đề không được trống",
      "content.required": "Nội dung không được trống",
      "post_category_id.required": "Loại tin không được trống",
      "post_category_id.exists": "Loại tin không tồn tại",
    }
  }

}

module.exports = Create
