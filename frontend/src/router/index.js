import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store";
import GerenciadorSalas from '@/features/salas/components/cpoGerenciadorSalas.vue'; // Sua tela principal
import cpoOrganizarSala from '@/features/salas/components/cpoOrganizarSala.vue'; // Sua tela de organizar

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
    path: "/entrar-sala",
    name: "EntrarSala",
    component: () => import('@/features/salas/components/cpoTelaAluno.vue'),
    
  },
  {
    path: "/account",
    name: "TelaSalas",
    component: () => import( '@/features/salas/views/viwTelaSalas.vue'),
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next() : next({ name: "Home" });
    },
  },
  {
    path: "/sala/:id/organizar",
    name: "OrganizarSala",
    component: () => import('@/features/salas/components/cpoOrganizarSala.vue'),
    props: true, // Permite passar o ID como prop
    beforeEnter: (to, from, next) => {
      store.state.user.isLoggedIn ? next() : next({ name: "cpoConectarUsuario" });
    },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import( '@/features/conectarUsuario/views/viwUsuarioNaoEncontrado.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
