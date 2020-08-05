import axios from 'axios'

Plugin.install = function (Vue, { store, router }) {
    let apiLocal = localStorage.getItem('apiLocal')
    Vue.prototype.$baseURL = `/api/`
    // Add a request interceptor
    axios.interceptors.request.use(
        function (config) {
            config.headers.Authorization = `Bearer ${store.state.token}`
            let apiLocal = localStorage.getItem('apiLocal')
            config.baseURL = Vue.prototype.$baseURL
            return config
        },
        function (error) {
            return Promise.reject(error)
        }
    )

    // Add a response interceptor
    axios.interceptors.response.use(
        function (response) {
            return response
        },
        function (error) {
            let { response } = error
            if (response) {
                let { status } = response
                console.log(response)

                switch (status) {
                    case 401:
                        store.dispatch("logout", true)
                        break
                    case 404:
                        router.push({ name: "404" })
                        break

                    default:
                        break
                }
            }
            return Promise.reject(error)
        }
    )
    Vue.prototype.$axios = axios
}
export default Plugin
