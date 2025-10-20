import { createRouter, createWebHashHistory } from "vue-router";
import Layout from '../layout/index.vue'
import HomePage from "../views/home/index.vue";

const router = createRouter({
    history:createWebHashHistory(),
    routes:[{
        path:'/', 
        redirect:'/home',
        component:Layout,
        children:[{
            path:'/home',
            name:'home',
            component:HomePage
        }]
    }]
})

export default router