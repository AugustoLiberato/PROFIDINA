import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store";


const routes = [
  {
    path: "/",
    name: "cpoConectarUsuario",
    component:() =>import ('@/features/conectarUsuario/components/cpoConectarUsuario.vue'), 
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next({ name: "TelaSalas" }) : next();
    },
  },
  {
    path: "/cpoCadastroUsuario",
    name: "cpoCadastroUsuario",
    component: () => import( '@/features/conectarUsuario/components/cpoCadastroUsuario.vue'),
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next({ name: "TelaSalas" }) : next();
    },
  },
  {
    path: "/account",
    name: "TelaSalas",
    component: () => import( '@/features/salas/viwTelaSalas.vue'),
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next() : next({ name: "Home" });
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import( '@/features/conectarUsuario/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
