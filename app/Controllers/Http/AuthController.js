'use strict'
const User = use("App/Models/User")
const Hash = use("Hash")
const Mail = use("Mail")
const { validateAll } = use("Validator")
const Cache = use('App/Helpers/Cache')

class AuthController {

    async register({ request, auth, response }) {
        // get user data from signup form
        const userData = request.only(["name", "email", "password"])

        try {
            const user = await User.create(userData)
            const token = await auth.generate(user)
            await Cache.removeCache('users')

            return response.json({ success: true, data: token })
        } catch (error) {
            return response.status(400).json({ success: false, message: "Có lỗi" })
        }
    }

    async socialLogin({ ally, auth, request, response }) {
        let input = request.only(['accessToken', 'provider'])
        try {
            const userData = await ally.driver(input.provider).getUserByToken(input.accessToken)

            // dữ liệu tìm user
            let findData = { email: userData.getEmail() || `${userData.getId()}@dinhgiaxe.vn` }
            const authUser = await User.query()
                .where({ email: findData.email })
                .with('roles', (builder) => builder.select("slug"))
                .first()
            if (authUser != null) {
                await authUser.tokens().delete()
                let data = await auth.generate(authUser)
                data.success = true
                data.user = authUser
                //
                return response.json(data)
            }

            const user = new User()
            user.name = userData.getName()
            // user.username = userData.getNickname()
            user.email = findData.email
            user.provider_id = userData.getId()
            user.avatar = userData.getAvatar()
            user.provider = input.provider

            await user.save()
            await user.tokens().delete()
            let data = await auth.generate(user)
            data.success = true
            data.user = user
            //
            await Cache.removeCache('users')
            return response.json(data)
        } catch (e) {
            console.log(e)
            return response.json(e)
        }
    }

    async login({ auth, response, request }) {
        let input = request.only(["email", "password"])
        let user = await User.query()
            .with('roles', (builder) => builder.select("slug"))
            .where("email", input.email)
            .first()
        if (user && (await Hash.verify(input.password, user.password))) {
            await user.tokens().delete()
            let data = await auth.generate(user)
            data.success = true
            data.user = Object.assign({}, user.toJSON())
            // data.user.roles = await user.getRoles()
            return response.json(data)
        }
        else return response.status(422).json({ success: false, message: "Email hoặc mật khẩu không chính xác" })

    }

    async logout({ auth, response }) {
        try {
            let user = await auth.getUser()
            await user.tokens().delete()
            return response.json({ success: true })
        } catch (error) {
            response.status(500).json({ success: false, message: 'Có lỗi' })
        }
    }

    async changePassword({ auth, response, request }) {
        try {
            let input = request.only(["old", "new", "confirm"])
            let user = await auth.getUser()
            let isPassword = await Hash.verify(input.old, user.password)
            if (isPassword) {
                user.password = input.new
                await user.save()
                await user.tokens().delete()
                return response.json({ success: true, message: "Đổi mật khẩu thành công." })
            } else {
                return response.status(422).json({
                    success: false,
                    message: "Mật khẩu hiện tại không đúng."
                })
            }
        } catch (error) {
            return response.json({ success: false, message: 'Có lỗi' })
        }

    }

    // async forgotPassword({ request, response }) {
    //     const validation = await validate(request.only("email"), {
    //         email: "required|email"
    //     })
    //     if (validation.fails()) {
    //         return response
    //             .status(422)
    //             .json({ success: false, message: validation.messages() })
    //     }
    //     let email = request.input("email")
    //     let user = await User.query()
    //         .where("email", email)
    //         .first()
    //     if (!user)
    //         return response.status(422).json({
    //             success: false,
    //             messages: [{ field: "email", message: "Email not found" }]
    //         })
    //     let token = uuid.v4()
    //     user.password_reset_token = token
    //     await user.save()
    //     let url = `${Env.get(
    //         "APP_URL",
    //         "http://localhost"
    //     )}/reset-password?token=${token}`
    //     await Mail.send("emails.password_reset", { url }, message => {
    //         message.to(user.email).subject("Email forgot password")
    //     })
    //         .then(() => response.json({ success: true }))
    //         .catch(error =>
    //             response.status(422).json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         )
    // }

    // async resetPassword({ request, response }) {
    //     let input = request.all(["token", "password", "password_confirmation"])
    //     let user = await User.query()
    //         .where("password_reset_token", input.token)
    //         .firstOrFail()
    //     user.password = input.password
    //     user.password_reset_token = null
    //     await user
    //         .save()
    //         .then(() => response.json({ success: true }))
    //         .catch(error =>
    //             response.json({
    //                 success: false,
    //                 message: error.message
    //             })
    //         )
    // }
}

module.exports = AuthController
