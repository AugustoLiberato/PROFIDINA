<template>
  <div class="organizacao-container">
    <!-- Loading inicial -->
    <div v-if="carregandoSala" class="loading-full">
      <p>⏳ Carregando sala...</p>
    </div>

    <template v-else-if="sala">
      <div class="header">
        <button @click="voltarParaSalas" class="btn-voltar">
          ← Voltar
        </button>
        <h1>{{ sala.nome }}</h1>
        <p class="codigo-sala">Código: {{ sala.codigo_sala }}</p>
      </div>

      <div class="config-section">
        <div class="config-group">
          <label>Número de alunos por grupo:</label>
          <input 
            type="number" 
            v-model.number="alunosPorGrupo" 
            min="2" 
            max="10"
            class="input-numero"
          />
        </div>

        <div class="config-group">
          <label>Algoritmo de ordenação:</label>
          <select v-model="algoritmoSelecionado" class="select-algoritmo">
            <option value="bubble">Bubble Sort</option>
            <option value="quick">Quick Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="insertion">Insertion Sort</option>
          </select>
        </div>

        <button @click="organizarGrupos" class="btn-organizar" :disabled="alunos.length === 0">
          🎲 Organizar Grupos Aleatoriamente
        </button>
      </div>

      <div class="alunos-section" v-if="carregandoAlunos">
        <div class="loading-state">
          <p>⏳ Carregando alunos...</p>
        </div>
      </div>

      <div class="alunos-section" v-else-if="alunos.length === 0">
        <div class="empty-state">
          <p>📚 Nenhum aluno na sala ainda</p>
          <p class="hint">Os alunos podem entrar usando o código: <strong>{{ sala.codigo_sala }}</strong></p>
        </div>
      </div>

      <div class="grupos-container" v-if="grupos.length > 0">
        <div class="info-organizacao">
          <p>✓ Grupos organizados usando <strong>{{ getNomeAlgoritmo() }}</strong></p>
          <p>Total de {{ grupos.length }} grupos formados</p>
        </div>

        <div class="grupos-grid">
          <div 
            v-for="(grupo, index) in grupos" 
            :key="index"
            class="grupo-card"
          >
            <div class="grupo-header">
              <h3>Grupo {{ index + 1 }}</h3>
              <span class="grupo-count">{{ grupo.length }} alunos</span>
            </div>
            <ul class="alunos-lista">
              <li v-for="aluno in grupo" :key="aluno.id" class="aluno-item">
                <span class="aluno-avatar">{{ getIniciais(aluno.nome_aluno) }}</span>
                <span class="aluno-nome">{{ aluno.nome_aluno }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="acoes-finais">
          <button @click="salvarOrganizacao" class="btn-salvar">
            💾 Salvar Organização
          </button>
          <button @click="exportarPDF" class="btn-exportar">
            📄 Exportar PDF
          </button>
          <button @click="reorganizar" class="btn-reorganizar">
            🔄 Reorganizar
          </button>
        </div>
      </div>

      <div class="lista-completa" v-if="alunos.length > 0 && grupos.length === 0">
        <h3>Alunos na sala ({{ alunos.length }})</h3>
        <div class="alunos-cards">
          <div v-for="aluno in alunos" :key="aluno.id" class="aluno-card">
            <span class="aluno-avatar">{{ getIniciais(aluno.nome_aluno) }}</span>
            <span class="aluno-nome">{{ aluno.nome_aluno }}</span>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="error-state">
      <p> Erro ao carregar sala</p>
      <button @click="voltarParaSalas" class="btn-voltar">← Voltar</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';

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

    const usuario = computed(() => store.state.user);

    // Carregar dados da sala
    const carregarSala = async () => {
      const salaId = route.params.id;
      
      try {
        const response = await axios.get(`http://localhost:3000/salas/${salaId}`);
        
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


    // Carregar alunos do banco de dados
const carregarAlunos = async () => {
  if (!sala.value || !usuario.value.id) return;
  
  carregandoAlunos.value = true;
  try {
    const response = await axios.get(
      `http://localhost:3000/salas/${sala.value.id}/alunos?professor_id=${usuario.value.id}`
    );
    
    if (response.data.success) {
      alunos.value = response.data.alunos;
      await carregarUltimaOrganizacao();
      
      //  DEPOIS de carregar os alunos, carregar a última organização
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
  // asd-------------------------------------------------------------------------------------

    const organizarGrupos = () => {
      if (alunos.value.length === 0) return;

      const alunosComChave = alunos.value.map(aluno => ({
        ...aluno,
        chaveAleatoria: Math.random()
      }));

      let alunosOrdenados;
      switch (algoritmoSelecionado.value) {
        case 'bubble':
          alunosOrdenados = bubbleSort([...alunosComChave]);
          break;
        case 'quick':
          alunosOrdenados = quickSort([...alunosComChave]);
          break;
        case 'merge':
          alunosOrdenados = mergeSort([...alunosComChave]);
          break;
        case 'insertion':
          alunosOrdenados = insertionSort([...alunosComChave]);
          break;
        default:
          alunosOrdenados = alunosComChave;
      }

      grupos.value = [];
      for (let i = 0; i < alunosOrdenados.length; i += alunosPorGrupo.value) {
        grupos.value.push(alunosOrdenados.slice(i, i + alunosPorGrupo.value));
      }
    };

    const bubbleSort = (arr) => {
      const n = arr.length;
      for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          if (arr[j].chaveAleatoria > arr[j + 1].chaveAleatoria) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          }
        }
      }
      return arr;
    };

    const quickSort = (arr) => {
      if (arr.length <= 1) return arr;
      
      const pivot = arr[Math.floor(arr.length / 2)];
      const left = arr.filter(x => x.chaveAleatoria < pivot.chaveAleatoria);
      const middle = arr.filter(x => x.chaveAleatoria === pivot.chaveAleatoria);
      const right = arr.filter(x => x.chaveAleatoria > pivot.chaveAleatoria);
      
      return [...quickSort(left), ...middle, ...quickSort(right)];
    };

    const mergeSort = (arr) => {
      if (arr.length <= 1) return arr;

      const mid = Math.floor(arr.length / 2);
      const left = mergeSort(arr.slice(0, mid));
      const right = mergeSort(arr.slice(mid));

      return merge(left, right);
    };

    const merge = (left, right) => {
      const result = [];
      let i = 0, j = 0;

      while (i < left.length && j < right.length) {
        if (left[i].chaveAleatoria <= right[j].chaveAleatoria) {
          result.push(left[i++]);
        } else {
          result.push(right[j++]);
        }
      }

      return [...result, ...left.slice(i), ...right.slice(j)];
    };

    const insertionSort = (arr) => {
      for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        
        while (j >= 0 && arr[j].chaveAleatoria > key.chaveAleatoria) {
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = key;
      }
      return arr;
    };

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

    const salvarOrganizacao = async () => {
      try {
        const organizacao = {
          sala_id: sala.value.id,
          algoritmo: algoritmoSelecionado.value,
          grupos: grupos.value.map((grupo, index) => ({
            numero: index + 1,
            alunos: grupo.map(a => a.id)
          })),
          data: new Date().toISOString()
        };
        
        const response = await axios.post('http://localhost:3000/organizacoes', organizacao);
        
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
      organizarGrupos();
    };

    const voltarParaSalas = () => {
      router.push({ name: 'TelaSalas' });
    };

    // NOVA FUNÇÃO: Carregar última organização salva-----------------------------------------------------------
const carregarUltimaOrganizacao = async () => {
  if (!sala.value) return;

  try {
    const response = await axios.get(
      `http://localhost:3000/salas/${sala.value.id}/ultima-organizacao`
    );

    if (response.data.success && response.data.organizacao) {
      const org = response.data.organizacao;
      
      // Restaurar algoritmo
      algoritmoSelecionado.value = org.algoritmo;
      
      // Restaurar grupos
      if (org.grupos_json && Array.isArray(org.grupos_json)) {
        grupos.value = org.grupos_json.map(grupo => {
          return grupo.alunos.map(alunoId => {
            return alunos.value.find(a => a.id === alunoId) || { 
              id: alunoId, 
              nome_aluno: 'Aluno não encontrado' 
            };
          });
        });
      }
    }
  } catch (error) {
    console.log('Nenhuma organização anterior encontrada');
  }
};
// -----------------------------------------------------------------------------------------------------

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
      voltarParaSalas
    };
  }
};
</script>

<style scoped>
.organizacao-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.loading-full,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.loading-full p,
.error-state p {
  font-size: 24px;
  color: #666;
  margin: 20px 0;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
}

.btn-voltar {
  position: absolute;
  left: 0;
  top: 0;
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-voltar:hover {
  background: #5a6268;
}

.header h1 {
  margin: 10px 0;
  color: #333;
}

.codigo-sala {
  color: #666;
  font-size: 14px;
}

.config-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.config-group {
  flex: 1;
  min-width: 200px;
}

.config-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.input-numero,
.select-algoritmo {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.btn-organizar {
  padding: 12px 30px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-organizar:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.btn-organizar:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.loading-state p,
.empty-state p {
  font-size: 18px;
  color: #666;
  margin: 10px 0;
}

.hint {
  font-size: 14px !important;
}

.hint strong {
  color: #007bff;
  font-size: 18px;
}

.info-organizacao {
  background: #d4edda;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
}

.info-organizacao p {
  margin: 5px 0;
  color: #155724;
}

.grupos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grupo-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.2s;
}

.grupo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.grupo-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grupo-header h3 {
  margin: 0;
  font-size: 18px;
}

.grupo-count {
  background: rgba(255,255,255,0.3);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.alunos-lista {
  list-style: none;
  padding: 15px;
  margin: 0;
}

.aluno-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.aluno-item:last-child {
  border-bottom: none;
}

.aluno-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

.aluno-nome {
  flex: 1;
  color: #333;
}

.acoes-finais {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-salvar,
.btn-exportar,
.btn-reorganizar {
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-salvar {
  background: #007bff;
  color: white;
}

.btn-salvar:hover {
  background: #0056b3;
}

.btn-exportar {
  background: #6c757d;
  color: white;
}

.btn-exportar:hover {
  background: #5a6268;
}

.btn-reorganizar {
  background: #ffc107;
  color: #000;
}

.btn-reorganizar:hover {
  background: #e0a800;
}

.lista-completa {
  margin-top: 30px;
}

.lista-completa h3 {
  margin-bottom: 15px;
  color: #333;
}

.alunos-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.aluno-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.2s;
}

.aluno-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .config-section {
    flex-direction: column;
  }

  .grupos-grid {
    grid-template-columns: 1fr;
  }

  .acoes-finais {
    flex-direction: column;
  }

  .btn-voltar {
    position: static;
    margin-bottom: 15px;
  }
}
</style>