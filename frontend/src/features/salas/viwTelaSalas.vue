<template>
  <div class="container-app">
    <!-- Header do usuário -->
    <header class="user-header">
      <div class="user-info">
        <h1>Olá, Bem vindo: {{ name }}</h1>
        <p>{{ email }}</p>
      </div>
      <button @click="logout()" class="btn-logout">Sair</button>
    </header>

    <!-- Navegação por abas -->
    <nav class="tabs-nav">
      <button 
        :class="['tab-button', { active: abaAtiva === 'salas' }]"
        @click="abaAtiva = 'salas'"
      >
        📚 Minhas Salas
      </button>
      <button 
        :class="['tab-button', { active: abaAtiva === 'perfil' }]"
        @click="abaAtiva = 'perfil'"
      >
        👤 Perfil
      </button>
    </nav>

    <!-- Conteúdo das abas -->
    <main class="tab-content">
      <!-- Aba Salas -->
      <div v-if="abaAtiva === 'salas'" class="tab-pane">
        <GerenciadorSalas />
      </div>

      <!-- Aba Perfil -->
      <div v-if="abaAtiva === 'perfil'" class="tab-pane">
        <div class="perfil-container">
          <h2>Informações do Perfil</h2>
          
          <div class="info-group">
            <label>Nome de Usuário:</label>
            <p>{{ name }}</p>
          </div>
          
          <div class="info-group">
            <label>E-mail:</label>
            <p>{{ email }}</p>
          </div>
          
          <div class="info-group">
            <label>Membro desde:</label>
            <p>{{ dataIngresso }}</p>
          </div>

          <div class="perfil-actions">
            <button class="btn-secondary" @click="editarPerfil">
              Editar Perfil
            </button>
            <button class="btn-secondary" @click="alterarSenha">
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import router from "@/router";
import GerenciadorSalas from "@/features/salas/components/cpoGerenciadorSalas.vue";

import { computed, ref } from "vue";
import { useStore } from "vuex";

export default {
  components: {
    GerenciadorSalas
  },
  setup() {
    const store = useStore();
    const abaAtiva = ref('salas'); // Começa na aba de salas

    const logout = () => {
      store.dispatch("user/logout");
      localStorage.clear();
      router.push({ name: "cpoConectarUsuario" });
    };

    // Funções para as ações do perfil (placeholder)
    const editarPerfil = () => {
      alert('Funcionalidade em desenvolvimento');
    };

    const alterarSenha = () => {
      alert('Funcionalidade em desenvolvimento');
    };

    return {
      abaAtiva,
      name: computed(() => store.state.user.name || store.state.user.username),
      email: computed(() => store.state.user.email),
      dataIngresso: computed(() => {
        // Por enquanto retorna data fictícia, depois pode vir do backend
        return new Date().toLocaleDateString('pt-BR');
      }),
      logout,
      editarPerfil,
      alterarSenha
    };
  },
};
</script>

<style lang="scss" scoped>
$primary: #48c9f4;
$secondary: #4038a0;
$danger: #dc3545;
$light: #f8f9fa;
$white: #fff;
$dark: #343a40;

.container-app {
  min-height: 100vh;
  background: linear-gradient(135deg, #0029e0 0%, #00ddff 100%);
  padding: 20px;
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 20px;
  color: $white;

  .user-info {
    h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    p {
      margin: 5px 0 0 0;
      opacity: 0.9;
      font-size: 14px;
    }
  }

  .btn-logout {
    background: rgb(0, 17, 143);
    border: 2px solid rgb(0, 195, 255);
    color: $white;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
     // background: rgb(0, 195, 255);
       background: rgb(0, 40, 52);
      border-color: rgba(0, 9, 73, 0.926);
      transform: translateY(-2px);
      color: $primary;
    }
  }
}

.tabs-nav {
  display: flex;
 // background: rgba(255, 255, 255, 0.1);
   background: rgba(0, 17, 144, 0.926);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 20px;
  gap: 8px;
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
 // color: rgba(255, 255, 255, 0.7);
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 16px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgb(0, 195, 255);
  }

  &.active {
    background: rgba(255, 255, 255, 0.2);
    color: $white;
    font-weight: 600;
  }
}

.tab-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  min-height: 600px;
  overflow: hidden;
}

.tab-pane {
  padding: 20px;
  height: 100%;
}

.perfil-container {
  max-width: 600px;
  margin: 0 auto;

  h2 {
    color: $secondary;
    margin-bottom: 30px;
    font-size: 24px;
  }

  .info-group {
    margin-bottom: 20px;
    padding: 15px 0;
    border-bottom: 1px solid #eee;

    &:last-of-type {
      border-bottom: none;
    }

    label {
      display: block;
      font-weight: 600;
      color: $dark;
      margin-bottom: 5px;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    p {
      margin: 0;
      font-size: 16px;
      color: $secondary;
    }
  }

  .perfil-actions {
    margin-top: 40px;
    display: flex;
    gap: 15px;
    justify-content: center;
  }

  .btn-secondary {
    background: transparent;
    color: $secondary;
    border: 2px solid $secondary;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      background: $secondary;
      color: $white;
      transform: translateY(-2px);
    }
  }
}

// Responsivo
@media (max-width: 768px) {
  .container-app {
    padding: 10px;
  }

  .user-header {
    flex-direction: column;
    text-align: center;
    gap: 20px;
    
    .user-info h1 {
      font-size: 24px;
    }
  }

  .tabs-nav {
    flex-direction: column;
  }

  .tab-button {
    text-align: center;
  }

  .perfil-container .perfil-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
