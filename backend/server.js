
//AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA



import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// 🗄️ CRIAR TABELAS (execute uma vez)
app.post('/create-tables', async (req, res) => {
  try {
    // Tabela de usuários (já existe)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de salas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS salas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        codigo_sala VARCHAR(10) UNIQUE NOT NULL,
        qr_code TEXT,
        professor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de alunos nas salas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sala_alunos (
        id SERIAL PRIMARY KEY,
        sala_id INTEGER REFERENCES salas(id) ON DELETE CASCADE,
        nome_aluno VARCHAR(255) NOT NULL,
        email_aluno VARCHAR(255),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    res.json({ message: 'Tabelas criadas com sucesso!' });
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    res.status(500).json({ error: 'Erro ao criar tabelas' });
  }
});

// 🔐 SIGNUP com hash da senha
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    // ✅ Verificar se email já existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // ✅ Hash da senha antes de salvar
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // ✅ Não retornar senha hasheada
    const newUser = result.rows[0];
    res.status(201).json({ 
      success: true,
      message: 'Usuário cadastrado com sucesso', 
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('💥 Erro no signup:', error);
    res.status(500).json({ error: 'Erro ao cadastrar usuário' });
  }
});

// 🔐 SIGNIN com verificação segura
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos' });
  }

  try {
    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'E-mail ou senha incorretos!' 
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // ✅ Retornar dados seguros incluindo ID
      res.json({ 
        success: true, 
        message: 'Login autorizado', 
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        error: 'E-mail ou senha incorretos!' 
      });
    }

  } catch (error) {
    console.error('💥 Erro no signin:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
});

// 🏫 CRIAR SALA
app.post('/salas', async (req, res) => {
  const { nome, descricao, professor_id } = req.body;

  if (!nome || !professor_id) {
    return res.status(400).json({ error: 'Nome da sala e professor são obrigatórios' });
  }

  try {
    // Gerar código único para a sala (6 caracteres)
    const codigo_sala = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    // Gerar QR Code (por enquanto só o código, depois pode implementar biblioteca de QR)
    const qr_code = `SALA:${codigo_sala}`;

    const result = await pool.query(
      `INSERT INTO salas (nome, descricao, codigo_sala, qr_code, professor_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, nome, descricao, codigo_sala, qr_code, created_at`,
      [nome, descricao, codigo_sala, qr_code, professor_id]
    );

    const novaSala = result.rows[0];
    res.status(201).json({
      success: true,
      message: 'Sala criada com sucesso!',
      sala: novaSala
    });

  } catch (error) {
    console.error('💥 Erro ao criar sala:', error);
    
    // Verificar se é erro de código duplicado
    if (error.code === '23505' && error.constraint === 'salas_codigo_sala_key') {
      return res.status(400).json({ error: 'Código da sala já existe. Tente novamente.' });
    }
    
    res.status(500).json({ error: 'Erro ao criar sala' });
  }
});

// 📚 LISTAR SALAS DO PROFESSOR
app.get('/salas/professor/:professor_id', async (req, res) => {
  const { professor_id } = req.params;
  // LOGS DE DEBUG
  console.log("🔍 BACKEND - professor_id recebido:", professor_id);
  console.log("🔍 BACKEND - tipo do professor_id:", typeof professor_id);
  
  if (!professor_id || professor_id === 'undefined') {
    console.log("❌ BACKEND - professor_id inválido");
    return res.status(400).json({ error: 'ID do professor inválido' });
  }
  try {
    const result = await pool.query(
      `SELECT s.id, s.nome, s.descricao, s.codigo_sala, s.qr_code, 
              s.created_at, s.updated_at,
              COUNT(sa.id) as total_alunos
       FROM salas s
       LEFT JOIN sala_alunos sa ON s.id = sa.sala_id
       WHERE s.professor_id = $1
       GROUP BY s.id, s.nome, s.descricao, s.codigo_sala, s.qr_code, s.created_at, s.updated_at
       ORDER BY s.created_at DESC`,
      [professor_id]
    );

    res.json({
      success: true,
      salas: result.rows
    });

  } catch (error) {
    console.error('💥 Erro ao buscar salas:', error);
    res.status(500).json({ error: 'Erro ao buscar salas' });
  }
});

// 🗑️ EXCLUIR SALA
app.delete('/salas/:sala_id', async (req, res) => {
  const { sala_id } = req.params;
  const { professor_id } = req.body;

  try {
    // Verificar se a sala pertence ao professor
    const salaResult = await pool.query(
      'SELECT id FROM salas WHERE id = $1 AND professor_id = $2',
      [sala_id, professor_id]
    );

    if (salaResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sala não encontrada ou sem permissão' });
    }

    // Excluir sala (os alunos serão excluídos automaticamente por CASCADE)
    await pool.query('DELETE FROM salas WHERE id = $1', [sala_id]);

    res.json({
      success: true,
      message: 'Sala excluída com sucesso!'
    });

  } catch (error) {
    console.error('💥 Erro ao excluir sala:', error);
    res.status(500).json({ error: 'Erro ao excluir sala' });
  }
});

// 📝 EDITAR SALA
app.put('/salas/:sala_id', async (req, res) => {
  const { sala_id } = req.params;
  const { nome, descricao, professor_id } = req.body;

  if (!nome || !professor_id) {
    return res.status(400).json({ error: 'Nome da sala é obrigatório' });
  }

  try {
    // Verificar se a sala pertence ao professor
    const salaResult = await pool.query(
      'SELECT id FROM salas WHERE id = $1 AND professor_id = $2',
      [sala_id, professor_id]
    );

    if (salaResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sala não encontrada ou sem permissão' });
    }

    // Atualizar sala
    const result = await pool.query(
      `UPDATE salas 
       SET nome = $1, descricao = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING id, nome, descricao, codigo_sala, qr_code, updated_at`,
      [nome, descricao, sala_id]
    );

    res.json({
      success: true,
      message: 'Sala atualizada com sucesso!',
      sala: result.rows[0]
    });

  } catch (error) {
    console.error('💥 Erro ao atualizar sala:', error);
    res.status(500).json({ error: 'Erro ao atualizar sala' });
  }
});

// 👥 ENTRAR NA SALA (via código)
app.post('/salas/entrar', async (req, res) => {
  const { codigo_sala, nome_aluno, email_aluno } = req.body;

  if (!codigo_sala || !nome_aluno) {
    return res.status(400).json({ error: 'Código da sala e nome do aluno são obrigatórios' });
  }

  try {
    // Verificar se a sala existe
    const salaResult = await pool.query(
      'SELECT id, nome FROM salas WHERE codigo_sala = $1',
      [codigo_sala]
    );

    if (salaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sala não encontrada' });
    }

    const sala = salaResult.rows[0];

    // Verificar se o aluno já está na sala
    const alunoExistente = await pool.query(
      'SELECT id FROM sala_alunos WHERE sala_id = $1 AND nome_aluno = $2',
      [sala.id, nome_aluno]
    );

    if (alunoExistente.rows.length > 0) {
      return res.status(400).json({ error: 'Aluno já está nesta sala' });
    }

    // Adicionar aluno à sala
    await pool.query(
      'INSERT INTO sala_alunos (sala_id, nome_aluno, email_aluno) VALUES ($1, $2, $3)',
      [sala.id, nome_aluno, email_aluno]
    );

    res.json({
      success: true,
      message: `Bem-vindo à sala "${sala.nome}"!`,
      sala_nome: sala.nome
    });

  } catch (error) {
    console.error('💥 Erro ao entrar na sala:', error);
    res.status(500).json({ error: 'Erro ao entrar na sala' });
  }
});

// 👥 LISTAR ALUNOS DE UMA SALA
app.get('/salas/:sala_id/alunos', async (req, res) => {
  const { sala_id } = req.params;
  const { professor_id } = req.query;

  try {
    // Verificar se a sala pertence ao professor
    const salaResult = await pool.query(
      'SELECT id, nome FROM salas WHERE id = $1 AND professor_id = $2',
      [sala_id, professor_id]
    );

    if (salaResult.rows.length === 0) {
      return res.status(403).json({ error: 'Sala não encontrada ou sem permissão' });
    }

    // Buscar alunos da sala
    const alunosResult = await pool.query(
      `SELECT id, nome_aluno, email_aluno, joined_at 
       FROM sala_alunos 
       WHERE sala_id = $1 
       ORDER BY joined_at DESC`,
      [sala_id]
    );

    res.json({
      success: true,
      sala_nome: salaResult.rows[0].nome,
      alunos: alunosResult.rows
    });

  } catch (error) {
    console.error('💥 Erro ao buscar alunos:', error);
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// 🔧 Rota para migrar senhas existentes (execute uma vez)
app.post('/migrate-passwords', async (req, res) => {
  try {
    const users = await pool.query('SELECT id, password FROM users');
    
    for (const user of users.rows) {
      // Verificar se já está hasheada (hash bcrypt sempre começa com $2)
      if (!user.password.startsWith('$2')) {
        const hashedPassword = await bcrypt.hash(user.password, 12);
        await pool.query(
          'UPDATE users SET password = $1 WHERE id = $2',
          [hashedPassword, user.id]
        );
        console.log(`✅ Senha do usuário ${user.id} migrada`);
      }
    }
    
    res.json({ message: 'Migração concluída' });
  } catch (error) {
    console.error('💥 Erro na migração:', error);
    res.status(500).json({ error: 'Erro na migração' });
  }
});

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));

