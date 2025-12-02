<template>
  <main>
    <viwCadastrarConectarUsuario 
      type="cpoConectarUsuario" 
      :errorMsg="errorSignIn" 
      @onSubmit="redirectToAccount" 
    />
  </main>
</template>

<script>
import viwCadastrarConectarUsuario from "@/features/conectarUsuario/views/viwCadastrarConectarUsuario.vue";
import router from "@/router";
import { ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import API_URL from '@/config/api.js';

export default {
  components: { viwCadastrarConectarUsuario },
  setup() {
    const store = useStore();
    const errorSignIn = ref("");

    const redirectToAccount = async (user) => {
      try {
        const response = await axios.post(`${API_URL}/cpoConectarUsuario`, user);

        if (response.data.success) {
          console.log("✅ Login bem-sucedido:", response.data.user);
          
          // ✅ CORRIGIDO: Agora usa 'nome' do backend
          const userData = {
            id: response.data.user.id,
            nome: response.data.user.nome,        // ← Backend retorna 'nome'
            username: response.data.user.nome,    // ← Compatibilidade com store antigo
            email: response.data.user.email
          };
          
          console.log("📦 Dados sendo salvos:", userData);
          
          store.dispatch("user/authentication", userData);
          
          router.push({ name: "TelaSalas" });
        } else {
          errorSignIn.value = "E-mail ou Senha incorretos!";
        }
      } catch (err) {
        console.error("❌ Erro no login:", err);
        
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