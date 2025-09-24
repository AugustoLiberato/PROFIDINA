import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store";


const routes = [
  // {
  //   path: "/",
  //   name: "Home",
  //   // component: Home,
  //   component: () => import('@/features/conect/views/Home.vue'),
  // },
  {
    path: "/",
    name: "SignIn",
    component:() =>import ('@/features/conect/components/SignIn.vue'), 
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next({ name: "UserAccount" }) : next();
    },
  },
  {
    path: "/signup",
    name: "SignUp",
    component: () => import( '@/features/conect/components/SignUp.vue'),
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next({ name: "UserAccount" }) : next();
    },
  },
  {
    path: "/account",
    name: "UserAccount",
    component: () => import( '@/features/salas/UserAccount.vue'),
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next() : next({ name: "Home" });
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import( '@/features/conect/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
