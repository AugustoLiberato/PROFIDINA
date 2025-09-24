<template>
  <main>
    <SignForm type="signup" :errorMsg="errorSignUp" @onSubmit="cadastrarUsuario" />
  </main>
</template>

<script>
import axios from "axios";
import SignForm from "@/features/conect/views/SignForm.vue";
import router from "@/router";
import { ref } from "vue";

export default {
  components: { SignForm },
  setup() {
    const errorSignUp = ref("");

    const cadastrarUsuario = async (userData) => {
      try {   
        errorSignUp.value = "";

        // Chamada à API para salvar no banco
        const response = await axios.post("http://localhost:3000/signup", userData);
        
        alert(response.data.message);
        router.push({ name: "SignIn" });
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


