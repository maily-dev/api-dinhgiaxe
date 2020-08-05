import Vue from 'vue'
import Vuex from 'vuex'
import VuexPersistence from 'vuex-persist'
import * as Cookies from 'js-cookie'

Vue.use(Vuex)
//
const vuexLocal = new VuexPersistence({
    storage: {
        getItem: (key) => Cookies.getJSON(key),
        setItem: (key, value) => Cookies.set(key, value, { expires: 365, secure: process.env.NODE_ENV !== 'development', domain: process.env.NODE_ENV === 'development' ? undefined : ".dinhgiaxe.vn" }),
        removeItem: (key) => Cookies.remove(key)
    },
    reducer: (state) => ({
        user: state.user,
        token: state.token,
    }),

})
//
export default new Vuex.Store({
    state() {
        return {
            user: {},
            token: null,
            makers: []
        }
    },
    mutations: {
        setMakers(state, val) {
            state.makers = val

        },
        setUser(state, val) {
            state.user = Object.assign({}, val)
            localStorage.setItem('user', JSON.stringify(val))
        },
        setToken(state, val) {
            state.token = val
            localStorage.setItem('token', val)
        }
    },
    actions: {
        async login({ commit }, payload) {
            let { data } = await Vue.prototype.$axios.post('auth/login', payload)
            commit('setUser', data.user)
            commit('setToken', data.token)
        },
        async logout({ commit }, payload) {

            if (!payload) {

                try {
                    await Vue.prototype.$axios.post('auth/logout')
                } catch (error) { }
            }
            commit('setUser', {})
            commit('setToken', '')
        }
    },
    modules: {},
    plugins: [vuexLocal.plugin]
})
