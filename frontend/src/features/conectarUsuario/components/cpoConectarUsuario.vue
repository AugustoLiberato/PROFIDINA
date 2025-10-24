<template>
  <main>
    <viwCadastrarConectarUsuario type="cpoConectarUsuario" :errorMsg="errorSignIn" @onSubmit="redirectToAccount" />
  </main>
</template>

<script>
import viwCadastrarConectarUsuario from "@/features/conectarUsuario/views/viwCadastrarConectarUsuario.vue";
import router from "@/router";
import { ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";

export default {
  components: { viwCadastrarConectarUsuario },
  setup() {
    const store = useStore();
    const errorSignIn = ref("");

    const redirectToAccount = async (user) => {
      try {
        const response = await axios.post("http://localhost:3000/cpoConectarUsuario", user);

        // se o backend retornar sucesso:
        if (response.data.success) {
          console.log(" Login bem-sucedido:", response.data.user);
          
          // Salvar dados completos do usuário no Vuex
          const userData = {
            id: response.data.user.id,           // ID do banco de dados
            username: response.data.user.username,
            email: response.data.user.email
          };
          
          store.dispatch("user/authentication", userData);
          
          router.push({ name: "TelaSalas" });
        } else {
          errorSignIn.value = "E-mail ou Senha incorretos!";
        }
      } catch (err) {
        console.error(" Erro no login:", err);
        
        if (err.response && err.response.data && err.response.data.error) {
          errorSignIn.value = err.response.data.error;
        } else {
          errorSignIn.value = "Erro ao conectar ao servidor!";
        }
      }
    };

    return {
      redirectToAccount,
      errorSignIn,
    };
  },
};
</script>