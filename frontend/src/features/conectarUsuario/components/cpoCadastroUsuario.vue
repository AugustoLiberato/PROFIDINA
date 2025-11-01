<template>
  <main>
    <viwCadastrarConectarUsuario type="cpoCadastroUsuario" :errorMsg="errorSignUp" @onSubmit="cadastrarUsuario" />
  </main>
</template>

<script>
import axios from "axios";
import viwCadastrarConectarUsuario from "@/features/conectarUsuario/views/viwCadastrarConectarUsuario.vue";
import router from "@/router";
import { ref } from "vue";
import API_URL from '@/config/api.js'; // 1. IMPORTAR A API_URL

export default {
  components: { viwCadastrarConectarUsuario },
  setup() {
    const errorSignUp = ref("");

    const cadastrarUsuario = async (userData) => {
      try {   
        errorSignUp.value = "";

        // 2. USAR A API_URL AQUI
        const response = await axios.post(`${API_URL}/cpoCadastroUsuario`, userData);
        
        alert(response.data.message);
        router.push({ name: "cpoConectarUsuario" });
      } catch (error) {
        console.error(error);
        errorSignUp.value = error.response?.data?.error || "Erro no cadastro";
      }
    };

    return {
      errorSignUp,
      cadastrarUsuario,
    };
  },
};
</script>


