import Vue from "vue"
import Router from "vue-router"
import Index from "@/views/Index"

Vue.use(Router)

export default new Router({
    mode: "history", // use HTML5 history instead of hashes
    routes: [
        {
            path: "/admin",
            component: () =>
                import(/* webpackChunkName: "js/layout-view" */ "@/layouts/view.vue"),
            children: [
                {
                    path: "/",
                    name: "Home",
                    component: Index
                },
                {
                    path: "crawler",
                    name: "Crawler",
                    component: () =>
                        import(/* webpackChunkName: "js/crawler" */ "@/views/crawler.vue")
                },
                {
                    path: "cars-crawl",
                    name: "CarsCrawl",
                    component: () =>
                        import(/* webpackChunkName: "js/cars-crawl" */ "@/views/cars-crawl.vue")
                },
                {
                    path: "posts",
                    name: "Posts",
                    component: () =>
                        import(/* webpackChunkName: "js/posts" */ "@/views/posts/index.vue")
                },
                {
                    path: "posts/:slug",
                    name: "PostsShow",
                    component: () =>
                        import(/* webpackChunkName: "js/posts-show" */ "@/views/posts/show.vue")
                },
                {
                    path: "cars",
                    name: "Cars",
                    component: () =>
                        import(/* webpackChunkName: "js/cars" */ "@/views/cars/index.vue")
                },
                {
                    path: "categories",
                    name: "Categories",
                    component: () =>
                        import(/* webpackChunkName: "js/categories" */ "@/views/post-categories/index.vue")
                },
                {
                    path: "comments",
                    name: "Comments",
                    component: () =>
                        import(/* webpackChunkName: "js/comments" */ "@/views/post-comments/index.vue")
                },
                {
                    path: "brands",
                    name: "Brands",
                    component: () =>
                        import(/* webpackChunkName: "js/brands" */ "@/views/cars/brands.vue")
                },
                {
                    path: "models",
                    name: "Models",
                    component: () =>
                        import(/* webpackChunkName: "js/models" */ "@/views/cars/models.vue")
                },
                {
                    path: "car-types",
                    name: "CarTypes",
                    component: () =>
                        import(/* webpackChunkName: "js/CarTypes" */ "@/views/cars/types.vue")
                },
                {
                    path: "attributes/:brand_slug/:model_slug/:car_type_slug",
                    name: "Attributes",
                    component: () =>
                        import(/* webpackChunkName: "js/attributes" */ "@/views/attributes.vue")
                },
                {
                    path: "car-ratings",
                    name: "CarRatings",
                    component: () =>
                        import(/* webpackChunkName: "js/car-ratings" */ "@/views/car-ratings.vue")
                },
                {
                    path: "users",
                    name: "Users",
                    component: () =>
                        import(/* webpackChunkName: "js/users" */ "@/views/users/index.vue")
                },
                {
                    path: "users/:id",
                    name: "UsersShow",
                    component: () =>
                        import(/* webpackChunkName: "js/users-show" */ "@/views/users/show.vue")
                },
                {
                    path: 'errors/404',
                    name: "404",
                    component: () =>
                        import(/* webpackChunkName: "js/errors-404" */ "@/views/errors/404.vue")
                },
                {
                    path: '*',
                    redirect: { name: '404' }
                }
            ]
        }
    ],
    scrollBehavior(to, from, savedPosition) {
        return { x: 0, y: 0 }
    }
})
