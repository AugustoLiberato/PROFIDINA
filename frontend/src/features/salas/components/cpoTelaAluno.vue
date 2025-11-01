<template>
  <div class="entrada-aluno-container">
    <div class="form-card">
      <div class="header-card">
        <h1>📚 Entrar na Sala</h1>
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
          <label>Seu Nome Completo *</label>
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

        <div class="form-group">
          <label>Seu E-mail (opcional)</label>
          <input 
            type="email" 
            v-model="formulario.email_aluno" 
            placeholder="joao@email.com"
          />
        </div>

        <button 
          @click="proximaEtapa" 
          class="btn-primary"
          :disabled="!formulario.codigo_sala || !formulario.nome_aluno || !formulario.rgm"
        >
          Continuar →
        </button>
      </div>

      <!-- Etapa 2: Questionário de Perfil -->
      <div v-if="etapa === 2" class="form-content">
        <h3>📋 Questionário de Perfil</h3>
        <p class="subtitle">Essas informações ajudarão na formação dos grupos</p>

        <!-- Pergunta 1: Interesse/Tema -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">1</span>
            Qual área/tema você tem mais interesse?
          </label>
          <div class="options-grid">
            <label 
              v-for="opcao in opcoes.interesses" 
              :key="opcao"
              class="option-card"
              :class="{ selected: formulario.interesse === opcao }"
            >
              <input 
                type="radio" 
                name="interesse" 
                :value="opcao" 
                v-model="formulario.interesse"
              />
              <span class="option-text">{{ opcao }}</span>
            </label>
          </div>
        </div>

        <!-- Pergunta 2: Perfil Comportamental -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">2</span>
            Como você se considera?
          </label>
          <div class="options-grid">
            <label 
              v-for="opcao in opcoes.perfis" 
              :key="opcao.valor"
              class="option-card"
              :class="{ selected: formulario.perfil === opcao.valor }"
            >
              <input 
                type="radio" 
                name="perfil" 
                :value="opcao.valor" 
                v-model="formulario.perfil"
              />
              <div class="option-content">
                <span class="option-text">{{ opcao.valor }}</span>
                <span class="option-desc">{{ opcao.descricao }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Pergunta 3: Experiência -->
        <div class="question-group">
          <label class="question-label">
            <span class="question-number">3</span>
            Você possui experiência profissional?
          </label>
          <div class="options-grid">
            <label 
              v-for="opcao in opcoes.experiencias" 
              :key="opcao.valor"
              class="option-card"
              :class="{ selected: formulario.experiencia === opcao.valor }"
            >
              <input 
                type="radio" 
                name="experiencia" 
                :value="opcao.valor" 
                v-model="formulario.experiencia"
              />
              <div class="option-content">
                <span class="option-text">{{ opcao.valor }}</span>
                <span class="option-desc">{{ opcao.descricao }}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="button-group">
          <button @click="voltarEtapa" class="btn-secondary">
            ← Voltar
          </button>
          <button 
            @click="entrarNaSala" 
            class="btn-primary"
            :disabled="!formulario.interesse || !formulario.perfil || !formulario.experiencia || carregando"
          >
            {{ carregando ? '⏳ Entrando...' : '✓ Entrar na Sala' }}
          </button>
        </div>
      </div>

      <!-- Mensagem de sucesso/erro -->
      <div v-if="mensagem" :class="['mensagem', tipoMensagem]">
        {{ mensagem }}
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
    const route = useRoute(); // Para ler a URL

    const formulario = ref({
      codigo_sala: '',
      nome_aluno: '',
      rgm: '',
      email_aluno: '',
      interesse: '',
      perfil: '',
      experiencia: ''
    });

    onMounted(() => {
      // Verifica se existe um parâmetro 'codigo' na URL
      const codigoDaURL = route.query.codigo;
      if (codigoDaURL) {
        // Preenche o campo do formulário
        formulario.value.codigo_sala = codigoDaURL.toUpperCase();
      }
    });

    const opcoes = {
      interesses: [
        'Tecnologia',
        'Saúde',
        'Educação',
        'Negócios',
        'Arte',
        'Ciências'
      ],
      perfis: [
        { 
          valor: 'Introvertido', 
          descricao: 'Prefiro trabalhar sozinho ou em grupos pequenos' 
        },
        { 
          valor: 'Extrovertido', 
          descricao: 'Gosto de interagir e trabalhar em grupo' 
        },
        { 
          valor: 'Equilibrado', 
          descricao: 'Me adapto a diferentes situações' 
        }
      ],
      experiencias: [
        { 
          valor: 'Não', 
          descricao: 'Não tenho experiência profissional' 
        },
        { 
          valor: 'Iniciante', 
          descricao: 'Menos de 1 ano de experiência' 
        },
        { 
          valor: 'Intermediário', 
          descricao: '1 a 3 anos de experiência' 
        },
        { 
          valor: 'Avançado', 
          descricao: 'Mais de 3 anos de experiência' 
        }
      ]
    };

    const mostrarMensagem = (texto, tipo = 'success') => {
      mensagem.value = texto;
      tipoMensagem.value = tipo;
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
          email_aluno: formulario.value.email_aluno,
          interesse: formulario.value.interesse,
          perfil: formulario.value.perfil,
          experiencia: formulario.value.experiencia
        });

        if (response.data.success) {
          mostrarMensagem(
            `✓ Bem-vindo à sala "${response.data.sala_nome}"! Aguarde o professor organizar os grupos.`,
            'success'
          );
          
          // Resetar formulário após 3 segundos
          setTimeout(() => {
            formulario.value = {
              codigo_sala: '',
              nome_aluno: '',
              rgm: '',
              email_aluno: '',
              interesse: '',
              perfil: '',
              experiencia: ''
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
      opcoes,
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
}

.header-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #666;
  margin: 0 0 30px 0;
  font-size: 14px;
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

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.option-card:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.option-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.option-card input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.mensagem {
  margin: 20px 30px;
  padding: 15px 20px;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
}

.mensagem.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.mensagem.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
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

  .options-grid {
    grid-template-columns: 1fr;
  }

  .button-group {
    flex-direction: column;
  }
}
</style>

