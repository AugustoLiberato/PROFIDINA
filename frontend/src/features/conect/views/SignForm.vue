<template>
  <div>
    <form @submit.prevent="onSubmit()">
      <div class='container'>
        <div class='card'>
          <div v-if="type === 'signup'" class='label-float'>
            <h1> Cadastrar </h1>
          </div>
          <div v-if="type === 'signin'" class='label-float'>
            <h1> Entrar </h1>
          </div>
         
          <div v-if="type === 'signup'" class='label-float'>
            <input type="text" name="username" placeholder="" v-model="username"  />
            <label for="username">Usuário</label>
          </div>

          <div class='label-float'>
            <input type='text' name="email" placeholder='' v-model="email"  />
            <label for='email'>Email</label>
          </div>

          <div class='label-float'>
            <input 
              v-bind:type="showPassword ? 'text' : 'password'" 
              name="password" 
              placeholder='' 
              v-model="password"  
            />
            <label for='password'>Password</label>
            <span @click="showPassword = !showPassword" class="password-toggle">
              <i v-if="showPassword" class="fas fa-eye-slash"></i>
              <i v-else class="fas fa-eye"></i>
            </span>
          </div>

          <p v-if="error" class="error-msg">Por favor, preencha todos os campos</p>
          <p v-else-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

          <div class='justify-center'>
            <button type="submit">{{ btnText }}</button>
          </div>

          <div v-if="type === 'signin'">
            <div class='justify-center'>
              <hr>  
            </div>
            <p> Não tem uma conta?
              <router-link to="/signup">Cadastre-se</router-link>
            </p>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import axios from "axios";
import router from "@/router";

export default {
  name: "SignForm",
  props: {
    type: String,
    errorMsg: String,
  },
  emits: ["onSubmit"], // Voltando ao nome original
  setup(props, { emit }) {
    const username = ref("");
    const password = ref("");
    const email = ref("");
    const error = ref(false);
    const showPassword = ref(false);

    // Função para executar login diretamente (APENAS para signin)
    const executarLoginDireto = async (userData) => {
      try {
        console.log("🚀 Fazendo login direto...");
        
        const response = await axios.post("http://localhost:3000/signin", userData);
        console.log("✅ Login OK:", response.data);

     if (response.data && response.data.success && response.data.user) {
      const userForStorage = {
        id: response.data.user.id,
        username: response.data.user.username,
        email: response.data.user.email
      };
          console.log("💾 Dados que serão salvos:", userForStorage);
        localStorage.setItem('user', JSON.stringify(userForStorage));

        alert(response.data.message || "Login realizado com sucesso!");
        
        // Força recarregamento da página na rota UserAccount
        window.location.href = '/account';
      
    }else {
      console.error("❌ Estrutura de resposta inválida:", response.data);
      alert("Erro na estrutura da resposta do servidor");
    }
      } catch (error) {
        console.error("❌ Erro:", error);
        alert(error.response?.data?.error || "Erro no login");
      }
    };

    const onSubmit = () => {
      console.log('🔹 Form submit executado');

      let userData = {};
      
      switch (props.type) {
        case "signup":
          error.value = !(username.value && password.value && email.value);
          userData = {
            username: username.value,
            password: password.value,
            email: email.value,
          };
          break;
          
        case "signin":
          error.value = !(email.value && password.value);
          userData = {
            email: email.value,
            password: password.value,
          };
          break;
          
        default:
          console.error("❌ Tipo desconhecido:", props.type);
          return;
      }

      if (!error.value) {
        console.log("🔹 Dados válidos:", userData);
        
        if (props.type === "signin") {
          // Para login, executa direto
          executarLoginDireto(userData);
        } else {
          // Para signup, usa o emit normal (que funciona)
          emit("onSubmit", userData);
        }
      } else {
        console.warn("⚠️ Campos faltando");
      }
    };

    return {
      error,
      username,
      password,
      email,
      showPassword,
      onSubmit,
      btnText: computed(() => (props.type === "signup" ? "Cadastrar" : "Entrar")),
    };
  },
};
</script>

<style lang="scss" scoped>
$orange: #48c9f4;
$purple: #272262;
$violet: #4038a0;
$card: #ffffff80;
$white: #fff;
$error: #ff4444;

h1 {
  text-align: center;
  margin-bottom: 20px;
  color: $orange;
}

.justify-center {
  display: flex;
  justify-content: center;
}

.label-float {
  position: relative;
  padding-top: 13px;
  margin-top: 5%;
  margin-bottom: 5%;

  input {
    width: 100%;
    padding: 5px;
    display: inline-block;
    border-bottom: 2px solid $orange;
    background: transparent;
    outline: none;
    border-left: none;
    border-right: none;
    border-top: none;

    &:focus {
      border-bottom: 2px solid $orange;

      + label {
        font-size: 13px;
        margin-top: 0;
        color: $violet;
      }
    }
  }

  label {
    color: $purple;
    pointer-events: none;
    position: absolute;
    top: -0.6rem;
    left: 0;
    margin-top: 13px;
    transition: all 0.3s ease-out;
  }

  .password-toggle {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: $purple;
    
    &:hover {
      color: $violet;
    }
  }
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
}

.card {
  background: $card;
  padding: 5rem;
  border-radius: 1rem;
  box-shadow: 3px 3px 1px 0px #00000060;
  min-width: 180px;
  font-size: 16px;
  transition: all 0.3s ease-out;
  width: 28rem;
}

button {
  font-weight: bold;
  font-size: 12pt;
  margin-top: 20px;
  border-radius: 5px;
  padding: 0.5rem 2rem;
  transition: all 0.3s ease-out;
  background: transparent;
  border: 2px solid $orange;
  color: $violet;
  cursor: pointer;

  &:hover {
    background: $orange;
    color: $white;
  }
}

hr {
  margin: 10% 0;
  width: 60%;
  background: $white;
  height: 2px;
}

p {
  color: $purple;
  font-size: 14pt;
  text-align: center;
}

.error-msg {
  color: $error;
  font-weight: bold;
}

a {
  color: $violet;
  font-weight: bold;
  text-decoration: none;
  transition: all 0.2s ease-out;

  &:hover {
    filter: brightness(0.8);
  }
}
</style>

