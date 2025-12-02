<template>
  <div class="entrada-aluno-container">
    <div class="form-card">
      <!-- Mensagem de sucesso/erro - MOVIDA PARA O TOPO -->
      <div v-if="mensagem" :class="['mensagem-topo', tipoMensagem]">
        {{ mensagem }}
      </div>

      <div class="header-card">
        <h1> Ingressar na Sala</h1>
        <p>Preencha seus dados para entrar na sala</p>
      </div>

      <!-- Etapa 1: Dados Básicos -->
      <div v-if="etapa === 1" class="form-content">
        <h3>Seus Dados</h3>
        
        <div class="form-group">
          <label>Código da Sala *</label>
          <input 
            type="text" 
            v-model="formulario.codigo_sala" 
            placeholder="Ex: A1B2C3"
            maxlength="6"
            @input="formulario.codigo_sala = formulario.codigo_sala.toUpperCase()"
            required
          />
        </div>

        <div class="form-group">
          <label> Nome e Sobrenome *</label>
          <input 
            type="text" 
            v-model="formulario.nome_aluno" 
            placeholder="Ex: João da Silva"
            required
          />
        </div>

        <div class="form-group">
          <label>Seu RGM (Registro Geral de Matrícula) *</label>
          <input 
            type="text" 
            v-model="formulario.rgm" 
            placeholder="Ex: 123456789"
            maxlength="20"
            @input="formulario.rgm = formulario.rgm.replace(/\D/g, '')"
            required
          />
          <small class="hint-text">Digite apenas números</small>
        </div>

        <button 
          @click="proximaEtapa" 
          class="btn-primary"
          :disabled="!formulario.codigo_sala || !formulario.nome_aluno || !formulario.rgm"
        >
          Continuar
        </button>
      </div>

      <!-- Etapa 2: Questionário de Perfil -->
      <div v-if="etapa === 2" class="form-content">
        <h3> Questionário de Perfil</h3>
        <p class="subtitle">
           NÃO HÁ OBRIGATORIEDADE DE RESPOSTA, DEIXE EM BRANCO CASO VOCÊ NÃO SE ENCAIXE EM NENHUMA DAS ALTERNATIVAS.
        </p>

        <!-- Pergunta 1: Disponibilidade para reuniões -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">1</span>
            Disponibilidade para reuniões além dos finais de semana?
          </label>
          <div class="checkbox-option">
            <label class="option-card checkbox-card" :class="{ selected: formulario.disponibilidade_reunioes }">
              <input 
                type="checkbox" 
                v-model="formulario.disponibilidade_reunioes"
              />
              <span class="option-text">Sim, tenho disponibilidade</span>
            </label>
          </div>
        </div>

        <!-- Pergunta 2: Tempo na faculdade -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">2</span>
            Tem mais de 1 ano na faculdade?
          </label>
          <div class="checkbox-option">
            <label class="option-card checkbox-card" :class="{ selected: formulario.mais_um_ano_faculdade }">
              <input 
                type="checkbox" 
                v-model="formulario.mais_um_ano_faculdade"
              />
              <span class="option-text">Sim, estou há mais de 1 ano</span>
            </label>
          </div>
        </div>

        <!-- Pergunta 3: Papel (múltipla escolha) -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">3</span>
            Papel (pode marcar mais de um)
          </label>
          <div class="options-grid-multiple">
            <label class="option-card checkbox-card" :class="{ selected: formulario.papel_organizacao }">
              <input type="checkbox" v-model="formulario.papel_organizacao" />
              <span class="option-text">Organização da parte de cada um</span>
            </label>
            <label class="option-card checkbox-card" :class="{ selected: formulario.papel_apresentar }">
              <input type="checkbox" v-model="formulario.papel_apresentar" />
              <span class="option-text">Apresentar para a sala</span>
            </label>
            <label class="option-card checkbox-card" :class="{ selected: formulario.papel_pesquisar }">
              <input type="checkbox" v-model="formulario.papel_pesquisar" />
              <span class="option-text">Pesquisar</span>
            </label>
            <label class="option-card checkbox-card" :class="{ selected: formulario.papel_preparar_apresentacao }">
              <input type="checkbox" v-model="formulario.papel_preparar_apresentacao" />
              <span class="option-text">Preparar Apresentação</span>
            </label>
          </div>
        </div>

        <!-- Pergunta 4: Perfil (múltipla escolha) -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">4</span>
            Perfil (pode marcar mais de um)
          </label>
          <div class="options-grid-multiple">
            <label class="option-card checkbox-card" :class="{ selected: formulario.perfil_extrovertido }">
              <input type="checkbox" v-model="formulario.perfil_extrovertido" />
              <span class="option-text">Extrovertido</span>
            </label>
            <label class="option-card checkbox-card" :class="{ selected: formulario.perfil_equilibrado }">
              <input type="checkbox" v-model="formulario.perfil_equilibrado" />
              <span class="option-text">Equilibrado</span>
            </label>
            <label class="option-card checkbox-card" :class="{ selected: formulario.perfil_mao_massa }">
              <input type="checkbox" v-model="formulario.perfil_mao_massa" />
              <div class="option-content">
                <span class="option-text">Mão na massa</span>
                <span class="option-desc">Fazer o software, protótipo, editar imagens</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Pergunta 5: Habilidade Técnica -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">5</span>
            Possui alguma habilidade técnica que possa contribuir com o projeto?
          </label>
          <div class="checkbox-option">
            <label class="option-card checkbox-card" :class="{ selected: formulario.perfil_habilidade_tecnica }">
              <input 
                type="checkbox" 
                v-model="formulario.perfil_habilidade_tecnica"
              />
              <div class="option-content">
                <span class="option-text">Possuo habilidade técnica que contribua com o projeto</span>
                <span class="option-desc">Ex: prototipação, edição de vídeo, imagem ou áudio</span>
              </div>
            </label>
          </div>
        </div>

        <div class="info-pontuacao">
          <p> Quanto mais respostas, maior a sua pontuação para formação de grupos equilibrados</p>
        </div>

        <div class="button-group">
          <button @click="voltarEtapa" class="btn-secondary">
            Voltar
          </button>
          <button 
            @click="entrarNaSala" 
            class="btn-primary"
            :disabled="carregando"
          >
            {{ carregando ? ' Entrando...' : ' Enviar informações' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import API_URL from '@/config/api.js';

export default {
  name: 'EntradaAluno',
  setup() {
    const etapa = ref(1);
    const carregando = ref(false);
    const mensagem = ref('');
    const tipoMensagem = ref('');
    const route = useRoute();

    const formulario = ref({
      codigo_sala: '',
      nome_aluno: '',
      rgm: '',
      // Campos do questionário
      disponibilidade_reunioes: false,
      mais_um_ano_faculdade: false,
      papel_organizacao: false,
      papel_apresentar: false,
      papel_pesquisar: false,
      papel_preparar_apresentacao: false,
      perfil_extrovertido: false,
      perfil_equilibrado: false,
      perfil_mao_massa: false,
      perfil_habilidade_tecnica: false
    });

    onMounted(() => {
      const codigoDaURL = route.query.codigo;
      if (codigoDaURL) {
        formulario.value.codigo_sala = codigoDaURL.toUpperCase();
      }
    });

    const mostrarMensagem = (texto, tipo = 'success') => {
      mensagem.value = texto;
      tipoMensagem.value = tipo;
      
      // Rolar para o topo do card para ver a mensagem
      setTimeout(() => {
        const formCard = document.querySelector('.form-card');
        if (formCard) {
          formCard.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      
      setTimeout(() => {
        mensagem.value = '';
      }, 5000);
    };

    const proximaEtapa = () => {
      if (!formulario.value.rgm || formulario.value.rgm.length < 4) {
        mostrarMensagem('Por favor, digite um RGM válido (mínimo 4 dígitos)', 'error');
        return;
      }
      etapa.value = 2;
    };

    const voltarEtapa = () => {
      etapa.value = 1;
    };

    const entrarNaSala = async () => {
      carregando.value = true;

      try {
        const response = await axios.post(`${API_URL}/salas/entrar-com-perfil`, {
          codigo_sala: formulario.value.codigo_sala,
          nome_aluno: formulario.value.nome_aluno,
          rgm: formulario.value.rgm,
          // Envia o questionário completo
          questionario: {
            disponibilidade_reunioes: formulario.value.disponibilidade_reunioes,
            mais_um_ano_faculdade: formulario.value.mais_um_ano_faculdade,
            papel_organizacao: formulario.value.papel_organizacao,
            papel_apresentar: formulario.value.papel_apresentar,
            papel_pesquisar: formulario.value.papel_pesquisar,
            papel_preparar_apresentacao: formulario.value.papel_preparar_apresentacao,
            perfil_extrovertido: formulario.value.perfil_extrovertido,
            perfil_equilibrado: formulario.value.perfil_equilibrado,
            perfil_mao_massa: formulario.value.perfil_mao_massa,
            perfil_habilidade_tecnica: formulario.value.perfil_habilidade_tecnica
          }
        });

        if (response.data.success) {
          mostrarMensagem(
            ` Você ingressou em: "${response.data.sala_nome}"!.`,
            'success'
          );
          
          // Resetar formulário após 3 segundos
          setTimeout(() => {
            formulario.value = {
              codigo_sala: '',
              nome_aluno: '',
              rgm: '',
              disponibilidade_reunioes: false,
              mais_um_ano_faculdade: false,
              papel_organizacao: false,
              papel_apresentar: false,
              papel_pesquisar: false,
              papel_preparar_apresentacao: false,
              perfil_extrovertido: false,
              perfil_equilibrado: false,
              perfil_mao_massa: false,
              perfil_habilidade_tecnica: false
            };
            etapa.value = 1;
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        mostrarMensagem(
          error.response?.data?.error || 'Erro ao entrar na sala. Verifique o código.',
          'error'
        );
      } finally {
        carregando.value = false;
      }
    };

    return {
      etapa,
      carregando,
      mensagem,
      tipoMensagem,
      formulario,
      proximaEtapa,
      voltarEtapa,
      entrarNaSala
    };
  }
};
</script>

<style scoped>
.entrada-aluno-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #4e4ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

/* MENSAGEM NO TOPO - FIXADA */
.mensagem-topo {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 15px 20px;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
  animation: slideDown 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.mensagem-topo.success {
  background: #4caf50;
  color: white;
}

.mensagem-topo.error {
  background: #f44336;
  color: white;
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #2d009f 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.header-card h1 {
  margin: 0 0 10px 0;
  font-size: 32px;
}

.header-card p {
  margin: 0;
  opacity: 0.9;
  font-size: 16px;
}

.form-content {
  padding: 40px 30px;
}

.form-content h3 {
  margin: 0 0 10px 0;
  color: #333;
  font-size: 24px;
}

.subtitle {
  color: #e91e63;
  margin: 0 0 30px 0;
  font-size: 14px;
  font-weight: 600;
  background: #fff3e0;
  padding: 12px;
  border-radius: 8px;
  border-left: 4px solid #e91e63;
}

.form-group {
  margin-bottom: 25px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.hint-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #999;
}

.question-group {
  margin-bottom: 35px;
}

.question-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
  font-weight: 600;
  color: #333;
  font-size: 18px;
}

.question-number {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.checkbox-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.options-grid-multiple {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.option-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-card {
  display: flex;
  align-items: flex-start;
}

.option-card:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #2d009f 100%);
  color: white;
}

.option-card input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.option-text {
  font-weight: 600;
  font-size: 15px;
}

.option-desc {
  font-size: 12px;
  opacity: 0.8;
}

.option-card.selected .option-desc {
  opacity: 0.9;
}

.info-pontuacao {
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  padding: 12px 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.info-pontuacao p {
  margin: 0;
  color: #1976d2;
  font-size: 14px;
  font-weight: 500;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn-primary,
.btn-secondary {
  padding: 14px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
  flex: 1;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #2d009f 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

@media (max-width: 768px) {
  .form-card {
    margin: 10px;
  }

  .header-card {
    padding: 30px 20px;
  }

  .header-card h1 {
    font-size: 24px;
  }

  .form-content {
    padding: 30px 20px;
  }

  .options-grid-multiple {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>

