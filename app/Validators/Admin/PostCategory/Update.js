'use strict'
const { POST_STATUS } = use("App/Helpers/Enum")
class Update {
  get rules() {
    return {
      name: "required",
      status: `required|in:${POST_STATUS.IN_ACTIVE},${POST_STATUS.ACTIVED},${POST_STATUS.DELETED}`,
    }
  }

  get sanitizationRules() {
    return {
      name: "trim",
      status: "trim"
    }
  }

  get messages() {
    return {
      "name.required": "Tiêu đề không được trống",
      "status.required": "Status không được trống",
      "status.in": "Status không đúng",
    }
  }
  get data() {
    const requestBody = this.ctx.request.all()
    const id = this.ctx.request.params.id

    return Object.assign({}, requestBody, { id })
  }
}

module.exports = Update
