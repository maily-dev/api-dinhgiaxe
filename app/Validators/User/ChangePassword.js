"use strict";

class ChangePassword {
    get rules() {
        return {
            old: "required",
            new: "required|min:8",
            confirm: "required|min:8|same:new"
        };
    }

    get sanitizationRules() {
        return {
            old: "trim",
            new: "trim",
            comfirm: "trim"
        };
    }
}

module.exports = ChangePassword;
