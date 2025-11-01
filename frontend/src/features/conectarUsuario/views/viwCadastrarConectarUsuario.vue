 <template>
  <div>
    <form @submit.prevent="onSubmit()">
      <div class='container'>
        <div class='card'>
          <div v-if="type === 'cpoCadastroUsuario'" class='label-float'>
            <h1>{{ cadastroStep === 1 ? 'Cadastrar' : 'Confirmar Email' }}</h1>
          </div>
<!-- cpoConectarUsuario -->
          <div v-if="type === 'cpoCadastroUsuario'" class='label-float'>
            <p> 
              <router-link to="/">Voltar</router-link>
            </p>

          </div>

          <div v-if="type === 'cpoConectarUsuario'" class='label-float'>
            <h1> Profidina Ágil  </h1>
          </div>
         
          <!-- STEP 1: Formulário inicial de cadastro -->
          <template v-if="type === 'cpoCadastroUsuario' && cadastroStep === 1">
            <div class='label-float'>
              <input type="text" name="username" placeholder="" v-model="username"  />
              <label for="username">Usuário</label>
            </div>

            <div class='label-float'>
              <input type='text' name="email" placeholder='' v-model="email" 
               pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    title="Digite um e-mail válido (deve conter @ e domínio)"
              required
              />
              <label for='email'>Email</label>
            </div>
            <!-- div da senha -->
            <div class='label-float'>
              <input 
                v-bind:type="showPassword ? 'text' : 'password'" 
                name="password" 
                placeholder='' 
                v-model="password"
                pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}"  
                title="Senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula e número"
                required

              />
              <label for='password'>Senha</label>
              <span @click="showPassword = !showPassword" class="password-toggle">
                <i v-if="showPassword" class="fas fa-eye-slash"></i>
                <i v-else class="fas fa-eye"></i>
              </span>
            </div>
              <!-- div de confirmar senha -->
            <div class='label-float'>
              <input 
                v-bind:type="showConfirmPassword ? 'text' : 'password'" 
                name="confirmPassword" 
                placeholder='' 
                v-model="confirmPassword"  
              />
              <label for='confirmPassword'>Confirmar Senha</label>
              <span @click="showConfirmPassword = !showConfirmPassword" class="password-toggle">
                <i v-if="showConfirmPassword" class="fas fa-eye-slash"></i>
                <i v-else class="fas fa-eye"></i>
              </span>
            </div>

            <p v-if="error" class="error-msg">Por favor, preencha todos os campos</p>
            <!-- <p v-else-if="passwordMismatch" class="error-msg">As senhas não coincidem</p> -->
             <p v-else-if="confirmPassword && password && password !== confirmPassword" class="error-msg">
                As senhas não coincidem
            </p>
            <p v-else-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <div class='justify-center'>
              <button type="submit" :disabled="enviandoCodigo">
                {{ enviandoCodigo ? 'Enviando...' : 'Enviar Código de Verificação' }}
              </button>
            </div>
          </template>

          <!-- STEP 2: Confirmação do código de verificação -->
          <template v-if="type === 'cpoCadastroUsuario' && cadastroStep === 2">
            <div class="info-message">
              <p>Um código de verificação foi enviado para:</p>
              <p class="email-highlight">{{ email }}</p>
              <p class="small-text">Verifique sua caixa de entrada e spam</p>
            </div>

            <div class='label-float'>
              <input 
                type='text' 
                name="verificationCode" 
                placeholder='' 
                v-model="verificationCode"
                maxlength="6"
              />
              <label for='verificationCode'>Código de Verificação</label>
            </div>

            <p v-if="codeError" class="error-msg">{{ codeError }}</p>

            <div class='justify-center'>
              <button type="submit" :disabled="verificandoCodigo">
                {{ verificandoCodigo ? 'Verificando...' : 'Confirmar e Cadastrar' }}
              </button>
            </div>

            <div class='justify-center' style="margin-top: 15px;">
              <button 
                type="button" 
                @click="reenviarCodigo" 
                class="secondary-btn"
                :disabled="reenvioDisabled"
              >
                {{ reenvioDisabled ? `Reenviar em ${tempoRestante}s` : 'Reenviar Código' }}
              </button>
            </div>

            <div class='justify-center' style="margin-top: 10px;">
              <a href="#" @click.prevent="voltarParaStep1" class="link-voltar">
                ← Voltar e alterar dados
              </a>
            </div>
          </template>

          <!-- STEP LOGIN (inalterado) -->
          <template v-if="type === 'cpoConectarUsuario'">
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
              <label for='password'>Senha</label>
              <span @click="showPassword = !showPassword" class="password-toggle">
                <i v-if="showPassword" class="fas fa-eye-slash"></i>
                <i v-else class="fas fa-eye"></i>
              </span>
            </div>

            <p v-if="error" class="error-msg">Por favor, preencha todos os campos</p>
            <p v-else-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

            <div class='justify-center'>
              <button type="submit">Entrar</button>
            </div>

            <div>
              <div class='justify-center'>
                <hr>  
              </div>
              <p> Não tem uma conta?
                <router-link to="/cpoCadastroUsuario">Cadastre-se</router-link>
              </p>
            </div>
          </template>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from "vue";
import axios from "axios";
import router from "@/router";
import API_URL from '@/config/api.js'; // 1. IMPORTAR A API_URL

export default {
  name: "SignForm",
  props: {
    type: String,
    errorMsg: String,
  },
  emits: ["onSubmit"],
  setup(props, { emit }) {
    const username = ref("");
    const password = ref("");
    const confirmPassword = ref("");
    const email = ref("");
    const verificationCode = ref("");
    const error = ref(false);
    const passwordMismatch = ref(false);
    const codeError = ref("");
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    
    const cadastroStep = ref(1); 
    const enviandoCodigo = ref(false);
    const verificandoCodigo = ref(false);
    const codigoEnviado = ref("");
    
    const reenvioDisabled = ref(false);
    const tempoRestante = ref(60);
    let intervalReenvio = null;

    const iniciarTimerReenvio = () => {
      reenvioDisabled.value = true;
      tempoRestante.value = 60;
      
      intervalReenvio = setInterval(() => {
        tempoRestante.value--;
        if (tempoRestante.value <= 0) {
          clearInterval(intervalReenvio);
          reenvioDisabled.value = false;
        }
      }, 1000);
    };

    onUnmounted(() => {
      if (intervalReenvio) {
        clearInterval(intervalReenvio);
      }
    });

    const enviarCodigoVerificacao = async () => {
      try {
        enviandoCodigo.value = true;
        // 2. CORRIGIDO AQUI
        const response = await axios.post(`${API_URL}/enviarCodigoVerificacao`, {
          email: email.value,
          username: username.value
        });

        if (response.data.success) {
          codigoEnviado.value = response.data.code; 
          cadastroStep.value = 2;
          iniciarTimerReenvio();
          alert("Código de verificação enviado para seu email!");
        }
      } catch (error) {
        alert(error.response?.data?.error || "Erro ao enviar código de verificação");
      } finally {
        enviandoCodigo.value = false;
      }
    };

    const reenviarCodigo = async () => {
      await enviarCodigoVerificacao();
    };

    const verificarECadastrar = async () => {
      try {
        verificandoCodigo.value = true;
        codeError.value = "";
        console.log("🔍 Verificando código:", verificationCode.value);
        // 3. CORRIGIDO AQUI
        const response = await axios.post(`${API_URL}/verificarECadastrar`, {
          email: email.value,
          username: username.value,
          password: password.value,
          verificationCode: verificationCode.value
        });

        if (response.data.success) {
          alert("Cadastro realizado com sucesso! Faça login para continuar.");
          router.push("/");
        }
      } catch (error) {
        codeError.value = error.response?.data?.error || "Código inválido";
      } finally {
        verificandoCodigo.value = false;
      }
    };

    const voltarParaStep1 = () => {
      cadastroStep.value = 1;
      verificationCode.value = "";
      codeError.value = "";
      if (intervalReenvio) {
        clearInterval(intervalReenvio);
      }
      reenvioDisabled.value = false;
    };
    
    // 4. REMOVIDA A FUNÇÃO 'executarLoginDireto' QUE USAVA LOCALHOST
    // E QUEBRAVA A LÓGICA DO VUE

    const onSubmit = () => {
      console.log('🔹 Form submit executado');
      error.value = false;
      passwordMismatch.value = false;
      codeError.value = "";
      
      switch (props.type) {
        case "cpoCadastroUsuario":
          if (cadastroStep.value === 1) {
            error.value = !(username.value && password.value && confirmPassword.value && email.value);
            
            if (!error.value) {
              if (password.value !== confirmPassword.value) {
                passwordMismatch.value = true;
                return;
              }
              enviarCodigoVerificacao();
            } else {
              console.warn("⚠️ Campos faltando");
            }
          } else if (cadastroStep.value === 2) {
            if (!verificationCode.value || verificationCode.value.length < 4) { // Ajustado para 4, mude se for 6
              codeError.value = "Por favor, insira o código de verificação";
              return;
            }
            verificarECadastrar();
          }
          break;
          
        case "cpoConectarUsuario":
          error.value = !(email.value && password.value);
          
          if (!error.value) {
            const userData = {
              email: email.value,
              password: password.value,
            };
            // 5. LÓGICA CORRIGIDA: Emitir os dados para o 'cpoConectarUsuario.vue' (pai)
            emit("onSubmit", userData);
          } else {
            console.warn("Campos faltando");
          }
          break;
          
        default:
          return;
      }
    };

    return {
      error,
      passwordMismatch,
      codeError,
      username,
      password,
      confirmPassword,
      email,
      verificationCode,
      showPassword,
      showConfirmPassword,
      cadastroStep,
      enviandoCodigo,
      verificandoCodigo,
      reenvioDisabled,
      tempoRestante,
      onSubmit,
      reenviarCodigo,
      voltarParaStep1,
      btnText: computed(() => (props.type === "cpoCadastroUsuario" ? "Cadastrar" : "Entrar")),
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

.info-message {
  background: rgba(72, 201, 244, 0.1);
  border-left: 3px solid $orange;
  padding: 15px;
  margin: 20px 0;
  border-radius: 5px;

  p {
    margin: 5px 0;
    font-size: 12pt;
  }

  .email-highlight {
    color: $violet;
    font-weight: bold;
    font-size: 14pt;
  }

  .small-text {
    font-size: 10pt;
    color: $purple;
    opacity: 0.8;
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

  &:hover:not(:disabled) {
    background: $orange;
    color: $white;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.secondary-btn {
  font-size: 10pt;
  padding: 0.4rem 1.5rem;
  margin-top: 10px;
}

.link-voltar {
  display: inline-block;
  margin-top: 15px;
  font-size: 11pt;
  color: $purple;
  text-decoration: none;
  
  &:hover {
    color: $violet;
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
