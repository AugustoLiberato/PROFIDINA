<!-- <template>
  <main>
    <SignForm type="signin" :errorMsg="errorSignIn" />
  </main>
</template>

<script>
import axios from "axios";
import SignForm from "@/features/conect/components/SignForm.vue";
import router from "@/router";
import { useStore } from "vuex";
import { ref, onMounted, onUnmounted } from "vue";

export default {
  components: { SignForm },
  setup() {
    const store = useStore();
    const errorSignIn = ref("");

    const fazerLogin = async (userData) => {
      console.log("🎯🎯🎯 LOGIN CAPTURADO! Dados:", userData);

      try {   
        errorSignIn.value = "";

        // Chamada à API 
        const response = await axios.post("http://localhost:3000/signin", userData);
        console.log("✅ API respondeu:", response.data);

        // Dados para o Vuex
        const userForStore = {
          username: userData.email.split('@')[0], // usa parte antes do @
          email: userData.email
        };

        // Atualiza o Vuex
        store.dispatch("user/authentication", userForStore);
        
        console.log("✅ Vuex atualizado - isLoggedIn:", store.state.user.isLoggedIn);

        alert("Login realizado com sucesso!");
        
        // Navega para UserAccount
        router.push({ name: "UserAccount" });
        console.log("✅ Navegando para UserAccount");
        
      } catch (error) {
        console.error("❌ Erro:", error);
        errorSignIn.value = error.response?.data?.error || "Erro no login";
      }
    };

    // Listener para capturar o evento do SignForm
    const handleLoginData = (event) => {
      console.log("🎯 Evento loginData capturado:", event.detail);
      fazerLogin(event.detail);
    };

    onMounted(() => {
      console.log("🔸 SignIn montado - adicionando listeners");
      window.addEventListener('loginData', handleLoginData);
      
      // Função de teste global
      window.testeLogin = () => {
        console.log("🧪 Executando teste manual");
        fazerLogin({ email: "tes", password: "123" });
      };
    });

    onUnmounted(() => {
      window.removeEventListener('loginData', handleLoginData);
      delete window.testeLogin;
    });

    return {
      errorSignIn,
    };
  },
};
</script> -->


  <template>
  <main>
    <SignForm type="signin" :errorMsg="errorSignIn" @onSubmit="redirectToAccount" />
  </main>
</template>

<script>
import SignForm from "@/features/conect/views/SignForm.vue";
import router from "@/router";
import { ref } from "vue";
import { useStore } from "vuex";
import axios from "axios";

export default {
  components: { SignForm },
  setup() {
    const store = useStore();
    const errorSignIn = ref("");

    const redirectToAccount = async (user) => {
      try {
        const response = await axios.post("http://localhost:3000/signin", user);

        // se o backend retornar sucesso:
        if (response.data.success) {
          console.log("✅ Login bem-sucedido:", response.data.user);
          
          // Salvar dados completos do usuário no Vuex
          const userData = {
            id: response.data.user.id,           // ID do banco de dados
            username: response.data.user.username,
            email: response.data.user.email
          };
          
          store.dispatch("user/authentication", userData);
          
          router.push({ name: "UserAccount" });
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