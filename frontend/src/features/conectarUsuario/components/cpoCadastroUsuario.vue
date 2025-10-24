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

export default {
  components: { viwCadastrarConectarUsuario },
  setup() {
    const errorSignUp = ref("");

    const cadastrarUsuario = async (userData) => {
      try {   
        errorSignUp.value = "";

        // Chamada à API para salvar no banco
        const response = await axios.post("http://localhost:3000/cpoCadastroUsuario", userData);
        
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


