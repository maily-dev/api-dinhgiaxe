import Vue from "vue"
import store from "@/store"
import { ws } from "../utils"

export default async () => {
    return new Promise((resolve, reject) => {
        Vue.ws.disconnect()
        Vue.ws.connect(
            {
                wsDomain: ws + location.host,
                jwtToken: store.state.token
            },
            {
                path: "adonis-ws",
                reconnectionAttempts: 300,
                reconnectionDelay: 5000
            }
        )
        Vue.ws.socket.on("open", () => {
            console.log("Đã kết nói socket thành công!")
            // userTopicSubscriptions();
            resolve()
        })

        // FOR EXAMPLE you can observe for userId or another variable from Vuex
        // store.watch(
        //   () => store.getters.vgUserUid,
        //   async id => {
        //     if (id) {
        //       userTopicSubscriptions(uid);
        //     }
        //   }
        // );
    })
}
