<template>
  <div class="tela-organizacao">
    <div v-if="carregandoSala" class="loading-full">
      <p>⏳ Carregando sala...</p>
    </div>

    <template v-else-if="sala">
      <div class="header-fixo">
        <div class="info-sala">
          <button @click="voltarParaSalas" class="btn btn-voltar">
            ← Voltar
          </button>
          <h2>{{ sala.nome }}</h2>
        </div>

        <div>
          <p class="codigo-sala">Código: {{ sala.codigo_sala }}</p>
          <span class="badge-alunos" v-if="!carregandoAlunos">{{ alunos.length }} alunos</span>
        </div>
      </div>

      <div class="config-section">
        <div class="config-row">
          <div class="config-item">
            <label>Número de alunos por grupo:</label>
            <input 
              type="number" 
              v-model.number="alunosPorGrupo" 
              min="2" 
              max="10"
              class="input-numero"
            />
          </div>

          <div class="config-item">
            <label>Algoritmo de ordenação:</label>
            <select v-model="algoritmoSelecionado" class="select-algoritmo">
              <option value="bubble">Bubble Sort</option>
              <option value="quick">Quick Sort</option>
              <option value="merge">Merge Sort</option>
              <option value="insertion">Insertion Sort</option>
            </select>
          </div>

          <button @click="organizarGrupos" class="btn btn-gerar" :disabled="alunos.length === 0">
            🎲 Organizar Grupos com Zig-Zag
          </button>
        </div>
        
        <div class="info-algoritmo" v-if="grupos.length > 0">
          <p>
            ✓ Grupos organizados com <strong>{{ getNomeAlgoritmo() }}</strong> + 
            <strong>Algoritmo Zig-Zag</strong>
          </p>
          <p class="descricao-zigzag">
            O Zig-Zag equilibra os grupos combinando alunos com maior pontuação 
            com alunos de menor pontuação
          </p>
        </div>
      </div>

      <div class="alunos-section" v-if="carregandoAlunos">
        <div class="loading-state">
          <p>⏳ Carregando alunos...</p>
        </div>
      </div>
      
      <div class="alunos-section" v-else-if="alunos.length === 0">
        <div class="vazio">
          <div class="icone">📚</div>
          <p>Nenhum aluno na sala ainda</p>
          <p class="hint">Os alunos podem entrar usando o código: <strong>{{ sala.codigo_sala }}</strong></p>
        </div>
      </div>

      <div class="grupos-container" v-if="grupos.length > 0">
        <div class="info-organizacao">
          <p>✓ Total de {{ grupos.length }} grupos formados</p>
        </div>

        <div class="grupos-grid">
          <div
            v-for="(grupo, index) in grupos"
            :key="index"
            class="grupo-card"
          >
            <div class="grupo-header">
              <h3>Grupo {{ index + 1 }}</h3>
              <span class="badge">{{ grupo.length }} alunos</span>
            </div>

            <ul class="membros-lista">
              <li
                v-for="aluno in grupo"
                :key="aluno.id"
                class="membro"
                :class="{ 'membro-lider': lideres[index] === aluno.id }"
              >
                <div class="membro-info">
                  <strong>{{ aluno.nome_aluno }}</strong>
                  <small v-if="aluno.rgm">RGM: {{ aluno.rgm }}</small>
                  <small class="pontuacao-aluno">📊 Pontuação: {{ aluno.pontuacao || 0 }}</small>
                </div>

                <div class="tags">
                  <span class="tag tag-perfil">{{ getIniciais(aluno.nome_aluno) }}</span>

                  <span v-if="lideres[index] === aluno.id" class="tag-lider">👑 Líder</span>
                  <button
                    v-else
                    @click="definirLider(index, aluno.id)"
                    class="btn-definir-lider"
                    title="Tornar Líder"
                  >
                    👑
                  </button>

                  <button
                    @click="iniciarExclusaoAluno(aluno)"
                    class="btn-excluir-aluno"
                    title="Excluir Aluno">
                    🗑️
                  </button>
                </div>
              </li>
            </ul>

            <!-- Estatísticas do grupo -->
            <div class="estatisticas-grupo">
              <span class="stat-item">
                📊 Pontuação média: {{ calcularPontuacaoMedia(grupo) }}
              </span>
            </div>
          </div>
        </div>

        <div class="acoes-finais">
          <button @click="salvarOrganizacao" class="btn btn-salvar">
            💾 Salvar Organização
          </button>
          <button @click="exportarPDF" class="btn btn-exportar">
            📄 Exportar PDF
          </button>
          <button @click="reorganizar" class="btn btn-reorganizar">
            🔄 Reorganizar
          </button>
        </div>
      </div>

      <div class="lista-completa" v-if="alunos.length > 0 && grupos.length === 0">
        <h3>Alunos na sala ({{ alunos.length }})</h3>
        <div class="alunos-cards">
          <div v-for="aluno in alunos" :key="aluno.id" class="aluno-card">
            <div class="aluno-card-info">
              <span class="aluno-avatar">{{ getIniciais(aluno.nome_aluno) }}</span>
              <div class="aluno-card-detalhes">
                <span class="aluno-nome">{{ aluno.nome_aluno }}</span>
                <small v-if="aluno.rgm" class="aluno-rgm">RGM: {{ aluno.rgm }}</small>
                <small class="aluno-pontuacao">📊 Pontuação: {{ calcularPontuacao(aluno) }}</small>
              </div>
            </div>
            <button
              @click="iniciarExclusaoAluno(aluno)"
              class="btn-excluir-aluno-card"
              title="Excluir Aluno">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <p>❌ Erro ao carregar sala</p>
      <button @click="voltarParaSalas" class="btn btn-voltar">← Voltar</button>
    </div>

    <div v-if="mostrarModalExcluir" class="modal">
      <div class="modal-box">
        <h3>Confirmar Exclusão</h3>
        <p>
          Você tem certeza que deseja remover o aluno
          <strong>{{ alunoParaExcluir?.nome_aluno }}</strong>
          <span v-if="alunoParaExcluir?.rgm"> (RGM: {{ alunoParaExcluir.rgm }})</span>
          da sala? Esta ação não pode ser desfeita.
        </p>
        <div class="modal-btns">
          <button @click="cancelarExclusao" class="btn btn-cancel">
            Cancelar
          </button>
          <button @click="confirmarExclusao" class="btn btn-danger" :disabled="iniciandoExclusao">
            {{ iniciandoExclusao ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import API_URL from '@/config/api.js';

export default {
  name: 'OrganizacaoSala',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

    const sala = ref(null);
    const alunos = ref([]);
    const grupos = ref([]);
    const alunosPorGrupo = ref(4);
    const algoritmoSelecionado = ref('bubble');
    const carregandoSala = ref(true);
    const carregandoAlunos = ref(false);
    const lideres = ref({});

    const mostrarModalExcluir = ref(false);
    const alunoParaExcluir = ref(null);
    const iniciandoExclusao = ref(false);

    const usuario = computed(() => store.state.user);

    const carregarSala = async () => {
      const salaId = route.params.id;
      try {
        const response = await axios.get(`${API_URL}/salas/${salaId}`);
        if (response.data.success) {
          sala.value = response.data.sala;
          await carregarAlunos();
        } else {
          console.error('Erro ao carregar sala:', response.data.error);
        }
      } catch (error) {
        console.error('Erro ao carregar sala:', error);
      } finally {
        carregandoSala.value = false;
      }
    };

    const carregarAlunos = async () => {
      if (!sala.value || !usuario.value.id) return;
      carregandoAlunos.value = true;
      try {
        const response = await axios.get(
          `${API_URL}/salas/${sala.value.id}/alunos?professor_id=${usuario.value.id}`
        );
        if (response.data.success) {
          alunos.value = response.data.alunos.map(aluno => ({
            ...aluno,
            rgm: aluno.rgm ? String(aluno.rgm) : null
          }));
          await carregarUltimaOrganizacao();
        } else {
          console.error('Erro ao carregar alunos:', response.data.error);
          alunos.value = [];
        }
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        alunos.value = [];
      } finally {
        carregandoAlunos.value = false;
      }
    };

    // Função para calcular pontuação de um aluno
    const calcularPontuacao = (aluno) => {
      let pontos = 0;
      
      if (!aluno.questionario) return 0;
      
      const q = aluno.questionario;
      
      // Perguntas simples (1 ponto cada)
      if (q.disponibilidade_reunioes) pontos += 1;
      if (q.mais_um_ano_faculdade) pontos += 1;
      
      // Papel (1 ponto por opção marcada)
      if (q.papel_organizacao) pontos += 1;
      if (q.papel_apresentar) pontos += 1;
      if (q.papel_pesquisar) pontos += 1;
      if (q.papel_preparar_apresentacao) pontos += 1;
      
      // Perfil (1 ponto por opção marcada)
      if (q.perfil_extrovertido) pontos += 1;
      if (q.perfil_equilibrado) pontos += 1;
      if (q.perfil_mao_massa) pontos += 1;
      if (q.perfil_habilidade_tecnica) pontos += 1;
      
      return pontos;
    };

    // ========== ALGORITMOS DE ORDENAÇÃO POR PONTUAÇÃO ==========

    const bubbleSortPontuacao = (arr) => {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          // Ordem decrescente (maior pontuação primeiro)
          if (arr[j].pontuacao < arr[j + 1].pontuacao) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          }
        }
      }
      return arr;
    };

    const quickSortPontuacao = (arr) => {
      if (arr.length <= 1) return arr;
      
      const pivot = arr[Math.floor(arr.length / 2)];
      const left = arr.filter(x => x.pontuacao > pivot.pontuacao);
      const middle = arr.filter(x => x.pontuacao === pivot.pontuacao);
      const right = arr.filter(x => x.pontuacao < pivot.pontuacao);
      
      return [...quickSortPontuacao(left), ...middle, ...quickSortPontuacao(right)];
    };

    const mergeSortPontuacao = (arr) => {
      if (arr.length <= 1) return arr;
      
      const mid = Math.floor(arr.length / 2);
      const left = mergeSortPontuacao(arr.slice(0, mid));
      const right = mergeSortPontuacao(arr.slice(mid));
      
      return mergePontuacao(left, right);
    };

    const mergePontuacao = (left, right) => {
      const result = [];
      let i = 0, j = 0;
      
      while (i < left.length && j < right.length) {
        // Ordem decrescente
        if (left[i].pontuacao >= right[j].pontuacao) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }
      
      return [...result, ...left.slice(i), ...right.slice(j)];
    };

    const insertionSortPontuacao = (arr) => {
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        // Ordem decrescente
        while (j >= 0 && arr[j].pontuacao < key.pontuacao) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = key;
      }
      return arr;
    };

    // ========== FUNÇÃO DE ORDENAÇÃO PRINCIPAL ==========

    const ordenarPorPontuacao = () => {
      // Cria cópia dos alunos com suas pontuações
      const alunosComPontuacao = alunos.value.map(aluno => ({
        ...aluno,
        pontuacao: calcularPontuacao(aluno)
      }));
      
      let alunosOrdenados;
      
      switch (algoritmoSelecionado.value) {
        case 'bubble':
          alunosOrdenados = bubbleSortPontuacao([...alunosComPontuacao]);
          break;
        case 'quick':
          alunosOrdenados = quickSortPontuacao([...alunosComPontuacao]);
          break;
        case 'merge':
          alunosOrdenados = mergeSortPontuacao([...alunosComPontuacao]);
          break;
        case 'insertion':
          alunosOrdenados = insertionSortPontuacao([...alunosComPontuacao]);
          break;
        default:
          alunosOrdenados = alunosComPontuacao;
      }
      
      return alunosOrdenados;
    };

    // ========== ALGORITMO ZIG-ZAG ==========

    const aplicarZigZag = (alunosOrdenados) => {
      const totalAlunos = alunosOrdenados.length;
      const tamanhoGrupo = alunosPorGrupo.value;
      const numeroGrupos = Math.ceil(totalAlunos / tamanhoGrupo);
      
      // Inicializa grupos vazios
      const gruposFormados = Array.from({ length: numeroGrupos }, () => []);
      
      // Distribui alunos em zig-zag
      let grupoAtual = 0;
      let direcao = 1; // 1 para frente, -1 para trás
      
      for (let i = 0; i < totalAlunos; i++) {
        gruposFormados[grupoAtual].push(alunosOrdenados[i]);
        
        // Muda de grupo
        if (direcao === 1) {
          if (grupoAtual === numeroGrupos - 1) {
            direcao = -1; // Inverte direção
          } else {
            grupoAtual++;
          }
        } else {
          if (grupoAtual === 0) {
            direcao = 1; // Inverte direção
          } else {
            grupoAtual--;
          }
        }
      }
      
      return gruposFormados;
    };

    // ========== FUNÇÃO PRINCIPAL DE ORGANIZAÇÃO ==========

    const organizarGrupos = () => {
      if (alunos.value.length === 0) return;
      
      lideres.value = {};
      
      // Passo 1: Ordenar alunos por pontuação usando o algoritmo selecionado
      const alunosOrdenados = ordenarPorPontuacao();
      
      // Passo 2: Aplicar Zig-Zag
      const gruposZigZag = aplicarZigZag(alunosOrdenados);
      
      grupos.value = gruposZigZag;
    };

    // ========== FUNÇÕES AUXILIARES ==========

    const getNomeAlgoritmo = () => {
      const nomes = {
        bubble: 'Bubble Sort',
        quick: 'Quick Sort',
        merge: 'Merge Sort',
        insertion: 'Insertion Sort'
      };
      return nomes[algoritmoSelecionado.value];
    };

    const getIniciais = (nome) => {
      if (!nome) return '??';
      return nome
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
    };

    const calcularPontuacaoMedia = (grupo) => {
      if (grupo.length === 0) return 0;
      const soma = grupo.reduce((acc, aluno) => acc + (aluno.pontuacao || 0), 0);
      return (soma / grupo.length).toFixed(1);
    };

    const salvarOrganizacao = async () => {
      try {
        const organizacao = {
          sala_id: sala.value.id,
          algoritmo: algoritmoSelecionado.value,
          grupos: grupos.value.map((grupo, index) => ({
            numero: index + 1,
            alunos: grupo.map(a => a.id),
            lider_id: lideres.value[index] || null
          })),
          data: new Date().toISOString()
        };
        
        const response = await axios.post(`${API_URL}/organizacoes`, organizacao);

        if (response.data.success) {
          alert('Organização salva com sucesso!');
        }
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar organização. Tente novamente.');
      }
    };

    const exportarPDF = () => {
      alert('Funcionalidade de exportação em desenvolvimento');
    };

    const reorganizar = () => {
      grupos.value = [];
      lideres.value = {};
      organizarGrupos();
    };

    const voltarParaSalas = () => {
      router.push({ name: 'TelaSalas' });
    };

    const definirLider = (grupoIndex, alunoId) => {
      lideres.value[grupoIndex] = alunoId;
    };

    const carregarUltimaOrganizacao = async () => {
      if (!sala.value) return;
      try {
        const response = await axios.get(
          `${API_URL}/salas/${sala.value.id}/ultima-organizacao`
        );
        if (response.data.success && response.data.organizacao) {
          const org = response.data.organizacao;
          algoritmoSelecionado.value = org.algoritmo;
          if (org.grupos_json && Array.isArray(org.grupos_json)) {
            const novosGrupos = [];
            const novosLideres = {};
            org.grupos_json.forEach((grupo, index) => {
              const alunosDoGrupo = grupo.alunos.map(alunoId => {
                const alunoEncontrado = alunos.value.find(a => a.id === alunoId);
                if (alunoEncontrado) {
                  return {
                    ...alunoEncontrado,
                    pontuacao: calcularPontuacao(alunoEncontrado)
                  };
                }
                return {
                  id: alunoId,
                  nome_aluno: 'Aluno não encontrado',
                  pontuacao: 0
                };
              });
              novosGrupos.push(alunosDoGrupo);
              if (grupo.lider_id) {
                novosLideres[index] = grupo.lider_id;
              }
            });
            grupos.value = novosGrupos;
            lideres.value = novosLideres;
          }
        }
      } catch (error) {
        console.log('Nenhuma organização anterior encontrada');
      }
    };

    const iniciarExclusaoAluno = (aluno) => {
      alunoParaExcluir.value = aluno;
      mostrarModalExcluir.value = true;
    };

    const cancelarExclusao = () => {
      alunoParaExcluir.value = null;
      mostrarModalExcluir.value = false;
    };

    const confirmarExclusao = async () => {
      if (!alunoParaExcluir.value) return;
      iniciandoExclusao.value = true;
      try {
        const alunoId = alunoParaExcluir.value.id;
        await axios.delete(`${API_URL}/alunos/${alunoId}`, {
          data: { professor_id: usuario.value.id }
        });
        
        alunos.value = alunos.value.filter(a => a.id !== alunoId);
        grupos.value = grupos.value.map(grupo =>
          grupo.filter(a => a.id !== alunoId)
        );
        grupos.value = grupos.value.filter(grupo => grupo.length > 0);
        
        for (const grupoIndex in lideres.value) {
          if (lideres.value[grupoIndex] === alunoId) {
            lideres.value[grupoIndex] = null;
          }
        }
        
        alert('Aluno removido com sucesso!');
        cancelarExclusao();
      } catch (error) {
        console.error('Erro ao excluir aluno:', error);
        alert(error.response?.data?.error || 'Erro ao excluir aluno. Tente novamente.');
      } finally {
        iniciandoExclusao.value = false;
      }
    };

    onMounted(() => {
      carregarSala();
    });

    return {
      sala,
      alunos,
      grupos,
      alunosPorGrupo,
      algoritmoSelecionado,
      carregandoSala,
      carregandoAlunos,
      organizarGrupos,
      getNomeAlgoritmo,
      getIniciais,
      salvarOrganizacao,
      exportarPDF,
      reorganizar,
      voltarParaSalas,
      lideres,
      definirLider,
      mostrarModalExcluir,
      alunoParaExcluir,
      iniciandoExclusao,
      iniciarExclusaoAluno,
      cancelarExclusao,
      confirmarExclusao,
      calcularPontuacao,
      calcularPontuacaoMedia
    };
  }
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.tela-organizacao {
  height: 100vh;
  overflow-y: auto;
  background: #f5f7fa;
  padding: 15px;
}

.header-fixo {
  background: white;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex-wrap: wrap;
  gap: 10px;
}

.info-sala {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-sala h2 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.codigo-sala {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.badge-alunos {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-voltar {
  background: #6c757d;
  color: white;
}

.btn-voltar:hover {
  background: #5a6268;
}

.btn-salvar {
  background: #28a745;
  color: white;
}

.btn-salvar:hover:not(:disabled) {
  background: #218838;
}

.btn-exportar {
  background: #007bff;
  color: white;
}

.btn-exportar:hover:not(:disabled) {
  background: #0056b3;
}

.btn-reorganizar {
  background: #ffc107;
  color: #333;
}

.btn-reorganizar:hover:not(:disabled) {
  background: #e0a800;
}

.config-section {
  background: white;
  border-radius: 8px;
  padding: 12px 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.config-row {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.config-item {
  flex: 1;
  min-width: 150px;
}

.config-item label {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  color: #555;
  font-size: 12px;
}

.config-item select,
.config-item input {
  width: 100%;
  padding: 8px 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 13px;
}

.btn-gerar {
  flex-shrink: 0;
  padding: 8px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  height: 38px;
}

.btn-gerar:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-gerar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.info-algoritmo {
  margin-top: 12px;
  padding: 10px;
  background: #e3f2fd;
  border-left: 4px solid #2196f3;
  border-radius: 6px;
}

.info-algoritmo p {
  margin: 5px 0;
  font-size: 13px;
  color: #1976d2;
}

.descricao-zigzag {
  font-size: 12px !important;
  color: #666 !important;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.grupo-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.grupo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

.grupo-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.badge {
  background: #e8eef5;
  color: #667eea;
  padding: 3px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.membros-lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
  max-height: 400px;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
}

.membro {
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 3px solid #667eea;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.membro-lider {
  background: #fffbef;
  border-left-color: #ffc107;
}

.membro-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 150px;
}

.membro-info strong {
  color: #2c3e50;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.membro-info small {
  font-size: 11px;
  color: #6c757d;
}

.pontuacao-aluno {
  color: #2196f3 !important;
  font-weight: 600;
}

.tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  align-items: center;
  flex-shrink: 0;
}

.tag {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
}

.tag-perfil {
  background: #f5f5f5;
  color: #616161;
}

.tag-lider {
  background: #ffc107;
  color: #333;
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.btn-definir-lider,
.btn-excluir-aluno {
  background: #e9ecef;
  color: #6c757d;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  padding: 0;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin-left: 4px;
}

.btn-definir-lider:hover {
  background: #ffc107;
  color: #333;
  transform: scale(1.1);
}

.btn-excluir-aluno:hover {
  background: #dc3545;
  color: white;
  transform: scale(1.1);
}

.estatisticas-grupo {
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
  margin-top: 8px;
}

.stat-item {
  font-size: 12px;
  color: #2196f3;
  font-weight: 600;
}

.vazio {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

.icone {
  font-size: 48px;
  margin-bottom: 10px;
}

.vazio p {
  color: #6c757d;
  margin: 0;
}

.hint {
  margin-top: 10px !important;
  font-size: 14px;
}

.lista-completa {
  background: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-top: 15px;
}

.lista-completa h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.alunos-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
}

.aluno-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  border-left: 3px solid #6c757d;
}

.aluno-card-info {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.aluno-card-detalhes {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aluno-avatar {
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.aluno-nome {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aluno-rgm {
  font-size: 12px;
  color: #6c757d;
}

.aluno-pontuacao {
  font-size: 11px;
  color: #2196f3;
  font-weight: 600;
}

.btn-excluir-aluno-card {
  background: none;
  border: none;
  font-size: 16px;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-excluir-aluno-card:hover {
  background: #e9ecef;
  color: #dc3545;
}

.acoes-finais {
  display: flex;
  gap: 10px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.acoes-finais .btn {
  flex: 1;
  min-width: 150px;
}

.info-organizacao {
  margin-bottom: 15px;
  padding: 10px;
  background: #d4edda;
  border-left: 4px solid #28a745;
  border-radius: 6px;
}

.info-organizacao p {
  margin: 5px 0;
  color: #155724;
  font-size: 14px;
}

.modal {
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

.modal-box {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 400px;
  width: 90%;
}

.modal-box h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
}

.modal-box p {
  margin: 0 0 20px 0;
  color: #6c757d;
  font-size: 14px;
}

.modal-btns {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-danger {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
  transition: all 0.2s;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-full,
.loading-state,
.error-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .header-fixo {
    flex-direction: column;
    align-items: stretch;
  }
  
  .config-row {
    flex-direction: column;
  }
  
  .config-item {
    width: 100%;
  }
  
  .btn-gerar {
    width: 100%;
  }
  
  .grupos-grid {
    grid-template-columns: 1fr;
  }
  
  .alunos-cards {
    grid-template-columns: 1fr;
  }
  
  .membro-info {
    max-width: calc(100% - 100px);
  }
  
  .acoes-finais {
    flex-direction: column;
  }
  
  .acoes-finais .btn {
    width: 100%;
  }
}
</style>