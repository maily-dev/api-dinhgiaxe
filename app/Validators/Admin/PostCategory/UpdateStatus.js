'use strict'
const { POST_STATUS } = use("App/Helpers/Enum")
class UpdateStatus {
    get rules() {
        return {
            action: `required|in:${POST_STATUS.IN_ACTIVE},${POST_STATUS.ACTIVED},${POST_STATUS.DELETED}`,
        }
    }

    get sanitizationRules() {
        return {
            action: "trim",
        }
    }

    get messages() {
        return {
            "action.in": "Action không đúng",
        }
    }
}

module.exports = UpdateStatus
