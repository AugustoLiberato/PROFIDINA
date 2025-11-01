<template>
  <div class="salas-container">
    <div class="header">
      <h2>Minhas Salas</h2>
      <button @click="mostrarFormCriar = !mostrarFormCriar" class="btn-primary">
        {{ mostrarFormCriar ? 'Cancelar' : '+ Nova Sala' }}
      </button>
    </div>

    <!-- Formulário para criar nova sala -->
    <div v-if="mostrarFormCriar" class="form-container">
      <form @submit.prevent="criarSala">
        <div class="form-group">
          <label for="nome">Nome da Sala *</label>
          <input 
            type="text" 
            id="nome" 
            v-model="novaSala.nome" 
            placeholder="Ex: Matemática - 3º Ano A"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="descricao">Descrição</label>
          <textarea 
            id="descricao" 
            v-model="novaSala.descricao"
            placeholder="Descrição opcional da sala"
            rows="3"
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="!novaSala.nome">
            Criar Sala
          </button>
        </div>
      </form>
    </div>

    <!-- Mensagens -->
    <div v-if="mensagem" :class="['mensagem', tipoMensagem]">
      {{ mensagem }}
    </div>

    <!-- Lista de salas -->
    <div class="salas-grid">
      <div v-if="salas.length === 0" class="empty-state">
        <p>Você ainda não criou nenhuma sala.</p>
        <p>Clique em "Nova Sala" para começar!</p>
      </div>

      <div v-for="sala in salas" :key="sala.id" class="sala-card">
        <div class="sala-header">
          <h3>{{ sala.nome }}</h3>
          <div class="sala-actions">
            <button @click="editarSala(sala)" class="btn-edit">✏️</button>
            <button @click="confirmarExclusao(sala)" class="btn-delete">🗑️</button>
          </div>
        </div>
        
        <p v-if="sala.descricao" class="sala-descricao">{{ sala.descricao }}</p>
        
        <div class="sala-info">
          <div class="codigo-sala">
            <strong>Código:</strong> 
            <span class="codigo">{{ sala.codigo_sala }}</span>
            <button @click="copiarCodigo(sala.codigo_sala)" class="btn-copy">📋</button>
          </div>
          
          <div class="alunos-count">
            <strong>Alunos:</strong> {{ sala.total_alunos }}
          </div>
          
          <div class="data-criacao">
            <small>Criada em: {{ formatarData(sala.created_at) }}</small>
          </div>
        </div>

        <div class="sala-actions-bottom">
          <button @click="entrarNaSala(sala)" class="btn-secondary">
            Entrar na sala
          </button>
          <button @click="gerarQRCode(sala)" class="btn-secondary">
            QR Code
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para editar sala -->
    <div v-if="salaEditando" class="modal-overlay" @click.self="cancelarEdicao">
      <div class="modal">
        <h3>Editar Sala</h3>
        <form @submit.prevent="salvarEdicao">
          <div class="form-group">
            <label for="edit-nome">Nome da Sala *</label>
            <input 
              type="text" 
              id="edit-nome" 
              v-model="salaEditando.nome" 
              required
            />
          </div>
          
          <div class="form-group">
            <label for="edit-descricao">Descrição</label>
            <textarea 
              id="edit-descricao" 
              v-model="salaEditando.descricao"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button type="button" @click="cancelarEdicao" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
 
    <!-- Modal de Confirmação para Excluir (Substitui o confirm()) -->
    <div v-if="salaParaExcluir" class="modal-overlay" @click.self="salaParaExcluir = null">
      <div class="modal">
        <h3>Confirmar Exclusão</h3>
        <p>Tem certeza que deseja excluir a sala "<strong>{{ salaParaExcluir.nome }}</strong>"?</p>
        <p>Esta ação não pode ser desfeita.</p>
        <div class="modal-actions">
          <button type="button" @click="salaParaExcluir = null" class="btn-secondary">
            Cancelar
          </button>
          <button type="button" @click="executarExclusao" class="btn-delete-confirm">
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para QR Code -->
    <div v-if="salaQRCode" class="modal-overlay" @click.self="salaQRCode = null">
      <div class="modal modal-qr">
        <h3>QR Code para: {{ salaQRCode.nome }}</h3>
        <p>Peça para seus alunos escanearem este código para entrar na sala.</p>
        <div class="qr-container">
          <canvas ref="qrCanvas"></canvas>
        </div>
        <p class="qr-link">{{ urlParaQRCode }}</p>
        <div class="modal-actions">
          <button type="button" @click="salaQRCode = null" class="btn-primary">
            Fechar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import axios from 'axios';
import API_URL from '@/config/api.js';
import QRCode from 'qrcode';

export default {
  name: 'GerenciadorSalas',
  setup() {
    const store = useStore();
    const router = useRouter();
    const salas = ref([]);
    const mostrarFormCriar = ref(false);
    const salaEditando = ref(null);
    const mensagem = ref('');
    const tipoMensagem = ref('');
    const salaParaExcluir = ref(null);
    
    // Novas variáveis para o QR Code
    const salaQRCode = ref(null);
    const qrCanvas = ref(null);
    const urlParaQRCode = ref('');

    const novaSala = ref({
      nome: '',
      descricao: ''
    });

    const usuario = computed(() => store.state.user);

    const mostrarMensagem = (texto, tipo = 'success') => {
      mensagem.value = texto;
      tipoMensagem.value = tipo;
      setTimeout(() => {
        mensagem.value = '';
      }, 3000);
    };

    const carregarSalas = async () => {
      if (!usuario.value.isLoggedIn) {
        console.warn('Usuário não está logado');
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/salas/professor/${usuario.value.id}`);
        if (response.data.success) {
          salas.value = response.data.salas;
        }
      } catch (error) {
        console.error('Erro ao carregar salas:', error);
        mostrarMensagem('Erro ao carregar salas', 'error');
      }
    };

    const criarSala = async () => {
      if (!novaSala.value.nome) return;
      if (!usuario.value.id) {
        mostrarMensagem('Erro: ID do usuário não encontrado. Faça login novamente.', 'error');
        return;
      }

      try {
        const dadosSala = {
          nome: novaSala.value.nome,
          descricao: novaSala.value.descricao,
          professor_id: usuario.value.id
        };
        const response = await axios.post(`${API_URL}/salas`, dadosSala);
        if (response.data.success) {
          mostrarMensagem('Sala criada com sucesso!');
          novaSala.value = { nome: '', descricao: '' };
          mostrarFormCriar.value = false;
          await carregarSalas();
        }
      } catch (error) {
        console.error('Erro ao criar sala:', error);
        mostrarMensagem(error.response?.data?.error || 'Erro ao criar sala', 'error');
      }
    };

    const editarSala = (sala) => {
      salaEditando.value = { ...sala };
    };

    const salvarEdicao = async () => {
      try {
        const dadosEdicao = {
          nome: salaEditando.value.nome,
          descricao: salaEditando.value.descricao,
          professor_id: usuario.value.id
        };
        const response = await axios.put(`${API_URL}/salas/${salaEditando.value.id}`, dadosEdicao);
        if (response.data.success) {
          mostrarMensagem('Sala atualizada com sucesso!');
          salaEditando.value = null;
          await carregarSalas();
        }
      } catch (error) {
        console.error('Erro ao editar sala:', error);
        mostrarMensagem(error.response?.data?.error || 'Erro ao editar sala', 'error');
      }
    };

    const cancelarEdicao = () => {
      salaEditando.value = null;
    };

    // Funções de exclusão com modal
    const confirmarExclusao = (sala) => {
      salaParaExcluir.value = sala;
    };

    const executarExclusao = async () => {
      if (!salaParaExcluir.value) return;
      try {
        const response = await axios.delete(`${API_URL}/salas/${salaParaExcluir.value.id}`, {
          data: { professor_id: usuario.value.id }
        });
        if (response.data.success) {
          mostrarMensagem('Sala excluída com sucesso!');
          await carregarSalas();
        }
      } catch (error) {
        console.error('Erro ao excluir sala:', error);
        mostrarMensagem(error.response?.data?.error || 'Erro ao excluir sala', 'error');
      } finally {
        salaParaExcluir.value = null;
      }
    };

    // Utilitários
    const copiarCodigo = async (codigo) => {
      try {
        await navigator.clipboard.writeText(codigo);
        mostrarMensagem('Código copiado!');
      } catch (error) {
        console.error('Erro ao copiar:', error);
        mostrarMensagem('Erro ao copiar código', 'error');
      }
    };

    const formatarData = (dataString) => {
      return new Date(dataString).toLocaleDateString('pt-BR');
    };

    const entrarNaSala = (sala) => {
      router.push({ 
        name: 'OrganizarSala',
        params: { id: sala.id }
      });
    };

    const gerarQRCode = (sala) => {
      const baseUrl = "https://profidina-7y65.vercel.app/entrar-sala";
      urlParaQRCode.value = `${baseUrl}?codigo=${sala.codigo_sala}`;
      salaQRCode.value = sala; // Abre o modal
    };

    // Observa a variável salaQRCode. Quando ela for preenchida,
    // espera o DOM atualizar (nextTick) e então desenha o QR Code.
    watch(salaQRCode, (novaSala) => {
      if (novaSala) {
        nextTick(() => {
          if (qrCanvas.value) {
            QRCode.toCanvas(
              qrCanvas.value, 
              urlParaQRCode.value, 
              { width: 250, margin: 2 }, 
              (error) => {
                if (error) console.error(error);
              }
            );
          }
        });
      }
    });

    onMounted(() => {
      carregarSalas();
    });

    return {
      salas,
      mostrarFormCriar,
      salaEditando,
      novaSala,
      mensagem,
      tipoMensagem,
      criarSala,
      editarSala,
      salvarEdicao,
      cancelarEdicao,
      copiarCodigo,
      formatarData,
      entrarNaSala,
      gerarQRCode,
      carregarSalas,
      salaParaExcluir,
      confirmarExclusao,
      executarExclusao,
      // Retornos para o QR Code
      salaQRCode,
      qrCanvas,
      urlParaQRCode
    };
  }
};
</script>

<style lang="scss" scoped>
$primary: #48c9f4;
$secondary: #4038a0;
$success: #28a745;
$error: #dc3545;
$warning: #ffc107;
$light: #f8f9fa;
$dark: #343a40;
$white: #fff;

.salas-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    color: $secondary;
    margin: 0;
  }
}

.form-container {
  background: $white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: $dark;
  }

  input, textarea {
    width: 100%;
    padding: 10px;
    border: 2px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    box-sizing: border-box;

    &:focus {
      outline: none;
      border-color: $primary;
    }
  }
}

.form-actions {
  text-align: right;
}

.mensagem {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;

  &.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }

  &.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
}

.salas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px;
  color: #6c757d;

  p {
    margin: 10px 0;
    font-size: 16px;
  }
}

.sala-card {
  background: $white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
}

.sala-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    color: $secondary;
    font-size: 18px;
    word-break: break-word;
    padding-right: 10px;
  }

  .sala-actions {
    display: flex;
    gap: 5px;
    flex-shrink: 0;
  }
}

.sala-descricao {
  color: #6c757d;
  font-size: 14px;
  margin-bottom: 15px;
  flex-grow: 1; 
}

.sala-info {
  margin-bottom: 15px;

  .codigo-sala {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;

    .codigo {
      background: $light;
      padding: 4px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: bold;
      color: $secondary;
      font-size: 16px;
    }
  }

  .alunos-count {
    margin-bottom: 10px;
    color: $dark;
  }

  .data-criacao {
    color: #6c757d;
    font-size: 12px;
  }
}

.sala-actions-bottom {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: auto; 
}

.btn-primary, .btn-secondary, .btn-edit, .btn-delete, .btn-copy, .btn-delete-confirm {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: $primary;
  color: $white;

  &:hover:not(:disabled) {
    background: darken($primary, 10%);
  }
}

.btn-secondary {
  background: transparent;
  color: $secondary;
  border: 2px solid $secondary;

  &:hover {
    background: $secondary;
    color: $white;
  }
}

.btn-edit {
  background: $warning;
  color: $dark; 
  padding: 4px 8px;
  font-size: 14px;

  &:hover {
    background: darken($warning, 10%);
  }
}

.btn-delete {
  background: $error;
  color: $white;
  padding: 4px 8px;
  font-size: 14px;

  &:hover {
    background: darken($error, 10%);
  }
}

.btn-delete-confirm {
  background: $error;
  color: $white;
  
  &:hover {
    background: darken($error, 10%);
  }
}


.btn-copy {
  background: $light;
  color: $secondary;
  padding: 4px 8px;
  font-size: 14px;

  &:hover {
    background: darken($light, 10%);
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: $white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 5px 20px rgba(0,0,0,0.2);

  h3 {
    margin-top: 0;
    margin-bottom: 20px;
    color: $secondary;
  }
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Estilos para o Modal QR Code */
.modal-qr {
  text-align: center;

  p {
    color: $dark;
    margin-bottom: 20px;
  }

  .qr-container {
    padding: 20px;
    background: $light;
    border-radius: 8px;
    display: inline-block;
    margin-bottom: 20px;
  }

  .qr-link {
    font-size: 12px;
    color: $secondary;
    word-break: break-all;
    background: $light;
    padding: 8px;
    border-radius: 4px;
  }

  canvas {
    max-width: 100%;
    height: auto;
  }
}


@media (max-width: 768px) {
  .salas-grid {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;

    h2 {
      text-align: center;
    }
  }

  .sala-actions-bottom {
    flex-direction: column;
  }

  .modal {
    margin: 20px;
    width: calc(100% - 40px);
  }
}
</style>

