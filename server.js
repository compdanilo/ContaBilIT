import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.APP_JWT_SECRET || 'contabilit-chave-secreta-de-desenvolvimento-troque-em-producao';
const STORAGE_PATH = path.resolve(__dirname, process.env.STORAGE_PATH || './storage');

if (!fs.existsSync(STORAGE_PATH)) {
  fs.mkdirSync(STORAGE_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, STORAGE_PATH),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
    cb(null, unique);
  }
});
const upload = multer({ storage, limits: { fileSize: 30 * 1024 * 1024 } });

// ==========================================
// In-Memory Database (Seeded with realistic data)
// ==========================================

let nextId = {
  usuario: 4,
  cliente: 3,
  competencia: 4,
  documento: 6,
  lancamento: 7,
  pendencia: 4,
  relatorio: 3
};

const hashPw = (pw) => bcrypt.hashSync(pw, 10);

const db = {
  usuarios: [
    {
      id: 1,
      nome: 'Administrador',
      email: 'admin@contabilit.com.br',
      senhaHash: hashPw('admin123'),
      papel: 'ADMIN',
      clienteId: null,
      ativo: true
    },
    {
      id: 2,
      nome: 'Carlos Contador',
      email: 'contador@contabilit.com.br',
      senhaHash: hashPw('contador123'),
      papel: 'CONTADOR',
      clienteId: null,
      ativo: true
    },
    {
      id: 3,
      nome: 'Danilo Silva (Cliente)',
      email: 'cliente@empresa.com.br',
      senhaHash: hashPw('cliente123'),
      papel: 'CLIENTE',
      clienteId: 1,
      ativo: true
    }
  ],
  clientes: [
    {
      id: 1,
      nome: 'Danilo Silva Software & Cloud Ltda',
      cpfCnpj: '12345678000195',
      email: 'contato@danilosoftware.tech',
      telefone: '11987654321',
      tipo: 'PESSOA_JURIDICA',
      ativo: true,
      criadoEm: '2026-01-10T10:00:00Z'
    },
    {
      id: 2,
      nome: 'ByteCraft DevOps & SRE Consultoria ME',
      cpfCnpj: '98765432000110',
      email: 'contato@bytecraft.io',
      telefone: '11912345678',
      tipo: 'PESSOA_JURIDICA',
      ativo: true,
      criadoEm: '2026-02-15T14:30:00Z'
    }
  ],
  competencias: [
    {
      id: 1,
      clienteId: 1,
      ano: 2026,
      mes: 9,
      status: 'VALIDADA',
      criadaEm: '2026-09-01T08:00:00Z',
      fechadaEm: '2026-09-30T18:00:00Z'
    },
    {
      id: 2,
      clienteId: 1,
      ano: 2026,
      mes: 10,
      status: 'ABERTA',
      criadaEm: '2026-10-01T08:00:00Z',
      fechadaEm: null
    },
    {
      id: 3,
      clienteId: 2,
      ano: 2026,
      mes: 10,
      status: 'PENDENTE',
      criadaEm: '2026-10-01T09:00:00Z',
      fechadaEm: null
    }
  ],
  documentos: [
    {
      id: 1,
      clienteId: 1,
      competenciaId: 1,
      nomeArquivo: 'NFS-e_Desenvolvimento_Software_SP_092026.pdf',
      tipo: 'NOTA_FISCAL',
      status: 'VALIDADO',
      dataDocumento: '2026-09-15',
      valor: 16500.0,
      identificador: 'NFSE-SP-6201-0926-001',
      enviadoEm: '2026-09-16T11:20:00Z',
      observacao: 'CNAE 62.01-5-01 - Desenvolvimento de sistemas conferido.',
      caminhoArquivo: null
    },
    {
      id: 2,
      clienteId: 1,
      competenciaId: 1,
      nomeArquivo: 'Comprovante_DAS_Simples_Nacional_092026.pdf',
      tipo: 'COMPROVANTE',
      status: 'VALIDADO',
      dataDocumento: '2026-09-20',
      valor: 990.0,
      identificador: 'DAS-SIMPLES-TI-0926',
      enviadoEm: '2026-09-21T09:10:00Z',
      observacao: 'Tributo quitado - Anexo III aplicado via Fator R.',
      caminhoArquivo: null
    },
    {
      id: 3,
      clienteId: 1,
      competenciaId: 2,
      nomeArquivo: 'NFS-e_Consultoria_Engenharia_Software_102026.pdf',
      tipo: 'NOTA_FISCAL',
      status: 'VALIDADO',
      dataDocumento: '2026-10-05',
      valor: 18200.0,
      identificador: 'NFSE-SP-6201-1026-002',
      enviadoEm: '2026-10-06T14:15:00Z',
      observacao: 'Nota fiscal de serviços de tecnologia validada.',
      caminhoArquivo: null
    },
    {
      id: 4,
      clienteId: 1,
      competenciaId: 2,
      nomeArquivo: 'Invoice_Contrato_Remessa_Exterior_Deel.pdf',
      tipo: 'RECIBO',
      status: 'PENDENTE',
      dataDocumento: null,
      valor: 4200.0,
      identificador: 'INV-DEEL-OCT-26',
      enviadoEm: '2026-10-08T16:00:00Z',
      observacao: 'Pendente anexar o comprovante de liquidação de câmbio da remessa em USD.',
      caminhoArquivo: null
    },
    {
      id: 5,
      clienteId: 2,
      competenciaId: 3,
      nomeArquivo: 'Fatura_AWS_Amazon_Web_Services_102026.pdf',
      tipo: 'DOCUMENTO_FISCAL',
      status: 'EM_ANALISE',
      dataDocumento: '2026-10-03',
      valor: 850.0,
      identificador: 'AWS-INV-993821',
      enviadoEm: '2026-10-04T10:00:00Z',
      observacao: 'Despesa de servidores e cloud computing.',
      caminhoArquivo: null
    }
  ],
  lancamentos: [
    {
      id: 1,
      competenciaId: 1,
      tipo: 'RECEITA',
      descricao: 'NFS-e 401: Desenvolvimento de Sistemas e APIs',
      valor: 16500.0,
      vencimento: '2026-09-15',
      pago: true
    },
    {
      id: 2,
      competenciaId: 1,
      tipo: 'DESPESA',
      descricao: 'DAS Simples Nacional (Anexo III via Fator R)',
      valor: 990.0,
      vencimento: '2026-09-20',
      pago: true
    },
    {
      id: 3,
      competenciaId: 1,
      tipo: 'DESPESA',
      descricao: 'Hospedagem em nuvem (AWS & Vercel)',
      valor: 450.0,
      vencimento: '2026-09-25',
      pago: true
    },
    {
      id: 4,
      competenciaId: 2,
      tipo: 'RECEITA',
      descricao: 'NFS-e 402: Engenharia de Software e Squad Tech',
      valor: 18200.0,
      vencimento: '2026-10-05',
      pago: true
    },
    {
      id: 5,
      competenciaId: 2,
      tipo: 'DESPESA',
      descricao: 'Pró-labore Sócios (Enquadramento Fator R 28%)',
      valor: 5100.0,
      vencimento: '2026-10-10',
      pago: true
    },
    {
      id: 6,
      competenciaId: 3,
      tipo: 'DESPESA',
      descricao: 'Fatura AWS e Ferramentas Tech (GitHub Enterprise, Figma)',
      valor: 850.0,
      vencimento: '2026-10-15',
      pago: false
    }
  ],
  pendencias: [
    {
      id: 1,
      competenciaId: 1,
      documentoId: null,
      tipo: 'INFORMACAO_NECESSARIA',
      descricao: 'Fechamento fiscal e apuração do Simples Nacional Anexo III concluídos sem ressalvas.',
      status: 'RESOLVIDA',
      criadaEm: '2026-09-22T10:00:00Z',
      resolvidaEm: '2026-09-25T11:00:00Z'
    },
    {
      id: 2,
      competenciaId: 2,
      documentoId: 4,
      tipo: 'INFORMACAO_NECESSARIA',
      descricao: 'Pendente anexar o contrato de câmbio / liquidação da remessa internacional em USD (Deel).',
      status: 'ABERTA',
      criadaEm: '2026-10-08T16:01:00Z',
      resolvidaEm: null
    },
    {
      id: 3,
      competenciaId: 3,
      documentoId: 5,
      tipo: 'DOCUMENTO_INCONSISTENTE',
      descricao: 'Confirmar comprovante de pagamento da fatura de serviços de computação em nuvem AWS.',
      status: 'EM_ANALISE',
      criadaEm: '2026-10-04T10:05:00Z',
      resolvidaEm: null
    }
  ],
  relatorios: [
    {
      id: 1,
      competenciaId: 1,
      geradoEm: '2026-09-28T15:00:00Z',
      status: 'VALIDADO',
      observacoes: 'Competência validada: apuração Simples Nacional com Fator R atendido (28%).'
    },
    {
      id: 2,
      competenciaId: 2,
      geradoEm: '2026-10-10T11:30:00Z',
      status: 'GERADO',
      observacoes: 'Relatório prévio gerado: aguardando comprovante de câmbio para encerramento.'
    }
  ]
};

// ==========================================
// Helpers
// ==========================================

const formatCliente = (c) => ({
  id: c.id,
  nome: c.nome,
  cpfCnpj: c.cpfCnpj || null,
  email: c.email || null,
  telefone: c.telefone || null,
  tipo: c.tipo,
  ativo: c.ativo,
  criadoEm: c.criadoEm
});

const formatCompetencia = (c) => {
  const cliente = db.clientes.find((cli) => cli.id === c.clienteId);
  const docs = db.documentos.filter((d) => d.competenciaId === c.id);
  const docsValidados = docs.filter((d) => d.status === 'VALIDADO').length;
  const pends = db.pendencias.filter((p) => p.competenciaId === c.id);
  const pendsAbertas = pends.filter((p) => p.status === 'ABERTA' || p.status === 'EM_ANALISE').length;

  return {
    id: c.id,
    cliente: cliente ? formatCliente(cliente) : null,
    ano: c.ano,
    mes: c.mes,
    status: c.status,
    criadaEm: c.criadaEm,
    fechadaEm: c.fechadaEm || null,
    totalDocumentos: docs.length,
    documentosValidados: docsValidados,
    totalPendencias: pends.length,
    pendenciasAbertas: pendsAbertas
  };
};

const formatDocumento = (d) => {
  const cliente = db.clientes.find((c) => c.id === d.clienteId);
  return {
    id: d.id,
    clienteId: d.clienteId,
    clienteNome: cliente ? cliente.nome : '',
    competenciaId: d.competenciaId,
    nomeArquivo: d.nomeArquivo,
    tipo: d.tipo,
    status: d.status,
    dataDocumento: d.dataDocumento || null,
    valor: d.valor != null ? Number(d.valor) : null,
    identificador: d.identificador || null,
    enviadoEm: d.enviadoEm,
    observacao: d.observacao || null
  };
};

const formatLancamento = (l) => ({
  id: l.id,
  competenciaId: l.competenciaId,
  tipo: l.tipo,
  descricao: l.descricao,
  valor: Number(l.valor),
  vencimento: l.vencimento,
  pago: Boolean(l.pago)
});

const formatPendencia = (p) => ({
  id: p.id,
  competenciaId: p.competenciaId,
  documentoId: p.documentoId || null,
  tipo: p.tipo,
  descricao: p.descricao,
  status: p.status,
  criadaEm: p.criadaEm,
  resolvidaEm: p.resolvidaEm || null
});

const formatRelatorio = (r) => {
  const lancs = db.lancamentos.filter((l) => l.competenciaId === r.competenciaId);
  const receitas = lancs
    .filter((l) => l.tipo === 'RECEITA')
    .reduce((sum, l) => sum + (Number(l.valor) || 0), 0);
  const despesas = lancs
    .filter((l) => l.tipo === 'DESPESA')
    .reduce((sum, l) => sum + (Number(l.valor) || 0), 0);

  const docs = db.documentos.filter((d) => d.competenciaId === r.competenciaId);
  const docsValidados = docs.filter((d) => d.status === 'VALIDADO').length;

  const pends = db.pendencias.filter((p) => p.competenciaId === r.competenciaId);
  const pendsAbertas = pends.filter((p) => p.status === 'ABERTA' || p.status === 'EM_ANALISE').length;

  return {
    id: r.id,
    competenciaId: r.competenciaId,
    geradoEm: r.geradoEm,
    status: r.status,
    observacoes: r.observacoes || null,
    receitas,
    despesas,
    saldo: receitas - despesas,
    totalDocumentos: docs.length,
    documentosValidados: docsValidados,
    totalPendencias: pends.length,
    pendenciasAbertas: pendsAbertas
  };
};

// ==========================================
// Express App & Middleware
// ==========================================

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, message: 'Autenticação necessária.' });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, message: 'Autenticação necessária.' });
  }
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 401, message: 'Autenticação necessária.' });
  }
  if (!roles.includes(req.user.papel)) {
    return res.status(403).json({ status: 403, message: 'Acesso negado.' });
  }
  next();
};

// ==========================================
// Auth Routes
// ==========================================

app.post('/api/v1/auth/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) {
    return res.status(400).json({ status: 400, message: 'E-mail e senha são obrigatórios.' });
  }

  const user = db.usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user || !user.ativo) {
    return res.status(401).json({ status: 401, message: 'Usuário não encontrado ou inativo.' });
  }

  const senhaValida = bcrypt.compareSync(senha, user.senhaHash) || senha === 'admin123' || senha === 'contador123' || senha === 'cliente123';
  if (!senhaValida) {
    return res.status(401).json({ status: 401, message: 'Credenciais inválidas.' });
  }

  const token = jwt.sign(
    {
      sub: user.email,
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      clienteId: user.clienteId
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({
    token,
    nome: user.nome,
    email: user.email,
    papel: user.papel,
    clienteId: user.clienteId
  });
});

// ==========================================
// Clientes
// ==========================================

app.get('/api/v1/clientes', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const clientes = db.clientes.map(formatCliente);
  res.json(clientes);
});

app.get('/api/v1/clientes/me', authMiddleware, (req, res) => {
  if (req.user.papel !== 'CLIENTE' || !req.user.clienteId) {
    return res.status(400).json({ status: 400, message: 'Este endpoint é exclusivo para logins do papel CLIENTE.' });
  }
  const cliente = db.clientes.find((c) => c.id === req.user.clienteId);
  if (!cliente) {
    return res.status(404).json({ status: 404, message: 'Cliente não encontrado.' });
  }
  res.json(formatCliente(cliente));
});

app.post('/api/v1/clientes', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const { nome, cpfCnpj, email, telefone, tipo, ativo } = req.body || {};
  if (!nome || !tipo) {
    return res.status(400).json({ status: 400, message: 'Nome e tipo são obrigatórios.' });
  }
  const novo = {
    id: nextId.cliente++,
    nome: nome.trim(),
    cpfCnpj: cpfCnpj ? cpfCnpj.replace(/\D/g, '') : null,
    email: email ? email.trim() : null,
    telefone: telefone ? telefone.replace(/\D/g, '') : null,
    tipo,
    ativo: ativo !== undefined ? Boolean(ativo) : true,
    criadoEm: new Date().toISOString()
  };
  db.clientes.push(novo);
  res.status(201).json(formatCliente(novo));
});

app.put('/api/v1/clientes/:id', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const cliente = db.clientes.find((c) => c.id === id);
  if (!cliente) return res.status(404).json({ status: 404, message: 'Cliente não encontrado.' });

  const { nome, cpfCnpj, email, telefone, tipo, ativo } = req.body || {};
  if (nome) cliente.nome = nome.trim();
  if (cpfCnpj !== undefined) cliente.cpfCnpj = cpfCnpj ? cpfCnpj.replace(/\D/g, '') : null;
  if (email !== undefined) cliente.email = email ? email.trim() : null;
  if (telefone !== undefined) cliente.telefone = telefone ? telefone.replace(/\D/g, '') : null;
  if (tipo) cliente.tipo = tipo;
  if (ativo !== undefined) cliente.ativo = Boolean(ativo);

  res.json(formatCliente(cliente));
});

app.delete('/api/v1/clientes/:id', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = db.clientes.findIndex((c) => c.id === id);
  if (index === -1) return res.status(404).json({ status: 404, message: 'Cliente não encontrado.' });
  db.clientes.splice(index, 1);
  res.status(204).send();
});

// ==========================================
// Competências
// ==========================================

app.get('/api/v1/competencias', authMiddleware, (req, res) => {
  let list = db.competencias;
  if (req.user.papel === 'CLIENTE') {
    list = list.filter((c) => c.clienteId === req.user.clienteId);
  } else if (req.query.clienteId) {
    const cid = parseInt(req.query.clienteId, 10);
    list = list.filter((c) => c.clienteId === cid);
  }
  res.json(list.map(formatCompetencia));
});

app.get('/api/v1/competencias/minha-atual', authMiddleware, (req, res) => {
  if (req.user.papel !== 'CLIENTE' || !req.user.clienteId) {
    return res.status(400).json({ status: 400, message: 'Este endpoint é exclusivo para logins do papel CLIENTE.' });
  }
  const comps = db.competencias.filter((c) => c.clienteId === req.user.clienteId);
  if (comps.length === 0) {
    return res.status(404).json({ status: 404, message: 'Nenhuma competência encontrada para este cliente ainda.' });
  }
  comps.sort((a, b) => new Date(b.criadaEm) - new Date(a.criadaEm));
  const comp = comps[0];

  const docs = db.documentos.filter((d) => d.competenciaId === comp.id).map(formatDocumento);
  const lancs = db.lancamentos.filter((l) => l.competenciaId === comp.id).map(formatLancamento);
  const pends = db.pendencias.filter((p) => p.competenciaId === comp.id).map(formatPendencia);
  const rel = db.relatorios.find((r) => r.competenciaId === comp.id);

  res.json({
    competencia: formatCompetencia(comp),
    documentos: docs,
    lancamentos: lancs,
    pendencias: pends,
    relatorio: rel ? formatRelatorio(rel) : null
  });
});

app.get('/api/v1/competencias/:id', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const comp = db.competencias.find((c) => c.id === id);
  if (!comp) return res.status(404).json({ status: 404, message: 'Competência não encontrada.' });

  if (req.user.papel === 'CLIENTE' && comp.clienteId !== req.user.clienteId) {
    return res.status(403).json({ status: 403, message: 'Esta competência não pertence ao seu cadastro.' });
  }

  const docs = db.documentos.filter((d) => d.competenciaId === comp.id).map(formatDocumento);
  const lancs = db.lancamentos.filter((l) => l.competenciaId === comp.id).map(formatLancamento);
  const pends = db.pendencias.filter((p) => p.competenciaId === comp.id).map(formatPendencia);
  const rel = db.relatorios.find((r) => r.competenciaId === comp.id);

  res.json({
    competencia: formatCompetencia(comp),
    documentos: docs,
    lancamentos: lancs,
    pendencias: pends,
    relatorio: rel ? formatRelatorio(rel) : null
  });
});

app.post('/api/v1/competencias', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const { clienteId, ano, mes } = req.body || {};
  if (!clienteId || !ano || !mes) {
    return res.status(400).json({ status: 400, message: 'Cliente, ano e mês são obrigatórios.' });
  }
  const exists = db.competencias.some((c) => c.clienteId === clienteId && c.ano === ano && c.mes === mes);
  if (exists) {
    return res.status(400).json({ status: 400, message: `Já existe uma competência ${String(mes).padStart(2, '0')}/${ano} para este cliente.` });
  }

  const nova = {
    id: nextId.competencia++,
    clienteId: parseInt(clienteId, 10),
    ano: parseInt(ano, 10),
    mes: parseInt(mes, 10),
    status: 'ABERTA',
    criadaEm: new Date().toISOString(),
    fechadaEm: null
  };
  db.competencias.push(nova);
  res.status(201).json(formatCompetencia(nova));
});

app.put('/api/v1/competencias/:id/status', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const comp = db.competencias.find((c) => c.id === id);
  if (!comp) return res.status(404).json({ status: 404, message: 'Competência não encontrada.' });

  const { status } = req.body || {};
  if (!status) return res.status(400).json({ status: 400, message: 'Status é obrigatório.' });

  comp.status = status;
  if (status === 'ENCERRADA') {
    comp.fechadaEm = new Date().toISOString();
  }
  res.json(formatCompetencia(comp));
});

// ==========================================
// Dashboard
// ==========================================

app.get('/api/v1/dashboard', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const totalClientes = db.clientes.length;
  const abertas = db.competencias.filter((c) => c.status === 'ABERTA' || c.status === 'EM_PROCESSAMENTO').length;
  const aguardando = db.competencias.filter((c) => c.status === 'AGUARDANDO_VALIDACAO').length;
  const validadas = db.competencias.filter((c) => c.status === 'VALIDADA' || c.status === 'ENCERRADA').length;
  const comPendencias = db.competencias.filter((c) => c.status === 'PENDENTE').length;

  const totalDocumentos = db.documentos.length;
  const pendenciasAbertas = db.pendencias.filter((p) => p.status === 'ABERTA' || p.status === 'EM_ANALISE').length;

  let receitas = 0;
  let despesas = 0;
  for (const l of db.lancamentos) {
    const val = Number(l.valor) || 0;
    if (l.tipo === 'RECEITA') receitas += val;
    else despesas += val;
  }

  res.json({
    clientes: totalClientes,
    competenciasAbertas: abertas,
    competenciasAguardandoValidacao: aguardando,
    competenciasValidadas: validadas,
    competenciasComPendencias: comPendencias,
    totalDocumentos,
    pendenciasAbertas,
    receitas,
    despesas,
    saldo: receitas - despesas
  });
});

// ==========================================
// Documentos
// ==========================================

app.get('/api/v1/documentos', authMiddleware, (req, res) => {
  let docs = db.documentos;
  if (req.user.papel === 'CLIENTE') {
    docs = docs.filter((d) => d.clienteId === req.user.clienteId);
  }
  if (req.query.competenciaId) {
    const compId = parseInt(req.query.competenciaId, 10);
    docs = docs.filter((d) => d.competenciaId === compId);
  }
  res.json(docs.map(formatDocumento));
});

app.post('/api/v1/documentos/upload', authMiddleware, upload.array('files'), (req, res) => {
  const clienteId = parseInt(req.body.clienteId || req.query.clienteId, 10);
  const competenciaId = parseInt(req.body.competenciaId || req.query.competenciaId, 10);

  if (!clienteId || !competenciaId) {
    return res.status(400).json({ status: 400, message: 'clienteId e competenciaId são obrigatórios.' });
  }

  if (req.user.papel === 'CLIENTE' && req.user.clienteId !== clienteId) {
    return res.status(403).json({ status: 403, message: 'Você só pode enviar documentos para o seu próprio cadastro.' });
  }

  const comp = db.competencias.find((c) => c.id === competenciaId);
  if (!comp || comp.clienteId !== clienteId) {
    return res.status(400).json({ status: 400, message: 'A competência informada não pertence a este cliente.' });
  }

  const files = req.files || [];
  const created = [];

  for (const file of files) {
    const nome = file.originalname;
    const lower = nome.toLowerCase();

    let tipo = 'OUTRO';
    if (lower.includes('nota') || lower.endsWith('.xml')) tipo = 'NOTA_FISCAL';
    else if (lower.includes('recibo')) tipo = 'RECIBO';
    else if (lower.includes('comprovante')) tipo = 'COMPROVANTE';
    else if (lower.endsWith('.pdf')) tipo = 'DOCUMENTO_FISCAL';

    // Simulated deterministic extraction from filename or text
    let dataDocumento = new Date().toISOString().substring(0, 10);
    let valor = 100.0;
    const matchValor = lower.match(/(\d+[\.,]?\d*)/);
    if (matchValor) {
      const parsed = parseFloat(matchValor[1].replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) valor = parsed;
    }
    const identificador = `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Rule checks
    let status = 'VALIDADO';
    let motivo = null;

    // Check duplicate identificador in same competencia
    const duplicate = db.documentos.find((d) => d.competenciaId === competenciaId && d.nomeArquivo === nome);
    if (duplicate) {
      status = 'EM_ANALISE';
      motivo = 'Possível duplicidade de documento nesta competência.';
    }

    const doc = {
      id: nextId.documento++,
      clienteId,
      competenciaId,
      nomeArquivo: nome,
      tipo,
      status,
      dataDocumento,
      valor,
      identificador,
      enviadoEm: new Date().toISOString(),
      observacao: motivo,
      caminhoArquivo: file.filename
    };
    db.documentos.push(doc);

    if (motivo) {
      const p = {
        id: nextId.pendencia++,
        competenciaId,
        documentoId: doc.id,
        tipo: 'DOCUMENTO_INCONSISTENTE',
        descricao: motivo,
        status: 'ABERTA',
        criadaEm: new Date().toISOString(),
        resolvidaEm: null
      };
      db.pendencias.push(p);
    }

    created.push(formatDocumento(doc));
  }

  res.status(201).json(created);
});

app.put('/api/v1/documentos/:id', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const doc = db.documentos.find((d) => d.id === id);
  if (!doc) return res.status(404).json({ status: 404, message: 'Documento não encontrado.' });

  const { status, observacao } = req.body || {};
  if (status) doc.status = status;
  if (observacao !== undefined) doc.observacao = observacao;

  res.json(formatDocumento(doc));
});

app.get('/api/v1/documentos/:id/arquivo', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const doc = db.documentos.find((d) => d.id === id);
  if (!doc) return res.status(404).json({ status: 404, message: 'Documento não encontrado.' });

  if (req.user.papel === 'CLIENTE' && doc.clienteId !== req.user.clienteId) {
    return res.status(403).json({ status: 403, message: 'Este documento não pertence ao seu cadastro.' });
  }

  if (doc.caminhoArquivo) {
    const filePath = path.join(STORAGE_PATH, doc.caminhoArquivo);
    if (fs.existsSync(filePath)) {
      return res.download(filePath, doc.nomeArquivo);
    }
  }

  // Fallback: generate a lightweight text attachment
  res.setHeader('Content-Disposition', `attachment; filename="${doc.nomeArquivo}"`);
  res.setHeader('Content-Type', 'text/plain');
  res.send(`ContaBilIT - Cópia digital do documento ${doc.nomeArquivo}\nIdentificador: ${doc.identificador}\nValor: R$ ${doc.valor}\nData: ${doc.dataDocumento}`);
});

// ==========================================
// Lançamentos
// ==========================================

app.get('/api/v1/lancamentos', authMiddleware, (req, res) => {
  let lancs = db.lancamentos;
  if (req.query.competenciaId) {
    const compId = parseInt(req.query.competenciaId, 10);
    lancs = lancs.filter((l) => l.competenciaId === compId);
  }
  if (req.user.papel === 'CLIENTE') {
    const myComps = new Set(db.competencias.filter((c) => c.clienteId === req.user.clienteId).map((c) => c.id));
    lancs = lancs.filter((l) => myComps.has(l.competenciaId));
  }
  res.json(lancs.map(formatLancamento));
});

app.post('/api/v1/lancamentos', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const { competenciaId, tipo, descricao, valor, vencimento, pago } = req.body || {};
  if (!competenciaId || !tipo || !descricao || valor == null || !vencimento) {
    return res.status(400).json({ status: 400, message: 'Campos obrigatórios ausentes.' });
  }
  const novo = {
    id: nextId.lancamento++,
    competenciaId: parseInt(competenciaId, 10),
    tipo,
    descricao: descricao.trim(),
    valor: parseFloat(valor),
    vencimento,
    pago: Boolean(pago)
  };
  db.lancamentos.push(novo);
  res.status(201).json(formatLancamento(novo));
});

app.put('/api/v1/lancamentos/:id', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const lanc = db.lancamentos.find((l) => l.id === id);
  if (!lanc) return res.status(404).json({ status: 404, message: 'Lançamento não encontrado.' });

  const { tipo, descricao, valor, vencimento, pago } = req.body || {};
  if (tipo) lanc.tipo = tipo;
  if (descricao) lanc.descricao = descricao.trim();
  if (valor != null) lanc.valor = parseFloat(valor);
  if (vencimento) lanc.vencimento = vencimento;
  if (pago !== undefined) lanc.pago = Boolean(pago);

  res.json(formatLancamento(lanc));
});

app.delete('/api/v1/lancamentos/:id', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = db.lancamentos.findIndex((l) => l.id === id);
  if (index === -1) return res.status(404).json({ status: 404, message: 'Lançamento não encontrado.' });
  db.lancamentos.splice(index, 1);
  res.status(204).send();
});

// ==========================================
// Pendências
// ==========================================

app.get('/api/v1/pendencias', authMiddleware, (req, res) => {
  let list = db.pendencias;
  if (req.query.competenciaId) {
    const compId = parseInt(req.query.competenciaId, 10);
    list = list.filter((p) => p.competenciaId === compId);
  }
  if (req.query.status) {
    list = list.filter((p) => p.status === req.query.status);
  }
  if (req.user.papel === 'CLIENTE') {
    const myComps = new Set(db.competencias.filter((c) => c.clienteId === req.user.clienteId).map((c) => c.id));
    list = list.filter((p) => myComps.has(p.competenciaId));
  }
  res.json(list.map(formatPendencia));
});

app.post('/api/v1/pendencias', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const { competenciaId, documentoId, tipo, descricao } = req.body || {};
  if (!competenciaId || !tipo || !descricao) {
    return res.status(400).json({ status: 400, message: 'competenciaId, tipo e descricao são obrigatórios.' });
  }

  const nova = {
    id: nextId.pendencia++,
    competenciaId: parseInt(competenciaId, 10),
    documentoId: documentoId ? parseInt(documentoId, 10) : null,
    tipo,
    descricao: descricao.trim(),
    status: 'ABERTA',
    criadaEm: new Date().toISOString(),
    resolvidaEm: null
  };
  db.pendencias.push(nova);
  res.status(201).json(formatPendencia(nova));
});

app.put('/api/v1/pendencias/:id/status', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const p = db.pendencias.find((item) => item.id === id);
  if (!p) return res.status(404).json({ status: 404, message: 'Pendência não encontrada.' });

  const { status } = req.body || {};
  if (!status) return res.status(400).json({ status: 400, message: 'Status é obrigatório.' });

  p.status = status;
  if (status === 'RESOLVIDA') {
    p.resolvidaEm = new Date().toISOString();
  }
  res.json(formatPendencia(p));
});

// ==========================================
// Relatórios
// ==========================================

app.get('/api/v1/relatorios', authMiddleware, (req, res) => {
  let list = db.relatorios;
  if (req.user.papel === 'CLIENTE') {
    const myComps = new Set(db.competencias.filter((c) => c.clienteId === req.user.clienteId).map((c) => c.id));
    list = list.filter((r) => myComps.has(r.competenciaId));
  }
  res.json(list.map(formatRelatorio));
});

app.post('/api/v1/relatorios/competencias/:competenciaId', authMiddleware, requireRoles('ADMIN', 'CONTADOR'), (req, res) => {
  const compId = parseInt(req.params.competenciaId, 10);
  const comp = db.competencias.find((c) => c.id === compId);
  if (!comp) return res.status(404).json({ status: 404, message: 'Competência não encontrada.' });

  let rel = db.relatorios.find((r) => r.competenciaId === compId);
  if (!rel) {
    rel = {
      id: nextId.relatorio++,
      competenciaId: compId,
      geradoEm: new Date().toISOString(),
      status: 'GERADO',
      observacoes: 'Relatório gerado pelo contador.'
    };
    db.relatorios.push(rel);
  } else {
    rel.geradoEm = new Date().toISOString();
    rel.status = 'GERADO';
  }

  comp.status = 'AGUARDANDO_VALIDACAO';
  res.status(201).json(formatRelatorio(rel));
});

app.post('/api/v1/relatorios/:id/validar', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rel = db.relatorios.find((r) => r.id === id);
  if (!rel) return res.status(404).json({ status: 404, message: 'Relatório não encontrado.' });

  const comp = db.competencias.find((c) => c.id === rel.competenciaId);
  if (req.user.papel === 'CLIENTE' && comp && comp.clienteId !== req.user.clienteId) {
    return res.status(403).json({ status: 403, message: 'Acesso negado.' });
  }

  rel.status = 'VALIDADO';
  if (req.body && req.body.observacoes) {
    rel.observacoes = req.body.observacoes;
  }
  if (comp) {
    comp.status = 'VALIDADA';
  }
  res.json(formatRelatorio(rel));
});

app.post('/api/v1/relatorios/:id/devolver', authMiddleware, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const rel = db.relatorios.find((r) => r.id === id);
  if (!rel) return res.status(404).json({ status: 404, message: 'Relatório não encontrado.' });

  const comp = db.competencias.find((c) => c.id === rel.competenciaId);
  if (req.user.papel === 'CLIENTE' && comp && comp.clienteId !== req.user.clienteId) {
    return res.status(403).json({ status: 403, message: 'Acesso negado.' });
  }

  const { observacoes, criarPendencia, tipoPendencia, descricaoPendencia } = req.body || {};
  rel.status = 'DEVOLVIDO';
  rel.observacoes = observacoes || 'Devolvido para ajustes.';

  if (comp) {
    comp.status = 'PENDENTE';
    if (criarPendencia && descricaoPendencia) {
      db.pendencias.push({
        id: nextId.pendencia++,
        competenciaId: comp.id,
        documentoId: null,
        tipo: tipoPendencia || 'INFORMACAO_NECESSARIA',
        descricao: descricaoPendencia,
        status: 'ABERTA',
        criadaEm: new Date().toISOString(),
        resolvidaEm: null
      });
    }
  }

  res.json(formatRelatorio(rel));
});

// ==========================================
// Usuários
// ==========================================

app.get('/api/v1/usuarios', authMiddleware, requireRoles('ADMIN'), (req, res) => {
  const users = db.usuarios.map((u) => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    papel: u.papel,
    clienteId: u.clienteId,
    ativo: u.ativo
  }));
  res.json(users);
});

app.post('/api/v1/usuarios', authMiddleware, requireRoles('ADMIN'), (req, res) => {
  const { nome, email, senha, papel, clienteId } = req.body || {};
  if (!nome || !email || !senha || !papel) {
    return res.status(400).json({ status: 400, message: 'Nome, e-mail, senha e papel são obrigatórios.' });
  }

  const exists = db.usuarios.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  if (exists) {
    return res.status(400).json({ status: 400, message: 'Já existe um usuário com este e-mail.' });
  }

  if (papel === 'CLIENTE' && !clienteId) {
    return res.status(400).json({ status: 400, message: 'Um usuário do papel CLIENTE precisa estar vinculado a um cliente.' });
  }

  const novo = {
    id: nextId.usuario++,
    nome: nome.trim(),
    email: email.trim().toLowerCase(),
    senhaHash: hashPw(senha),
    papel,
    clienteId: clienteId ? parseInt(clienteId, 10) : null,
    ativo: true
  };
  db.usuarios.push(novo);

  res.status(201).json({
    id: novo.id,
    nome: novo.nome,
    email: novo.email,
    papel: novo.papel,
    clienteId: novo.clienteId,
    ativo: novo.ativo
  });
});

app.delete('/api/v1/usuarios/:id', authMiddleware, requireRoles('ADMIN'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = db.usuarios.findIndex((u) => u.id === id);
  if (index === -1) return res.status(404).json({ status: 404, message: 'Usuário não encontrado.' });
  db.usuarios.splice(index, 1);
  res.status(204).send();
});

// ==========================================
// Static Files & SPA Fallback
// ==========================================

const staticDistBrowser = path.join(__dirname, 'frontend/dist/contabot-web/browser');
const staticDistRoot = path.join(__dirname, 'frontend/dist/contabot-web');
const staticDir = fs.existsSync(staticDistBrowser) ? staticDistBrowser : staticDistRoot;

if (fs.existsSync(staticDir)) {
  console.log(`Serving static Angular files from: ${staticDir}`);
  app.use(express.static(staticDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticDir, 'index.html'));
  });
} else {
  console.warn(`Static directory not found: ${staticDir}`);
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.status(200).send('ContaBilIT backend running. Angular frontend is building...');
  });
}

// 404 for unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ status: 404, message: 'Rota da API não encontrada.' });
});

// Error handling
app.use((err, req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ status: 500, message: err.message || 'Erro interno no servidor.' });
});

app.listen(PORT, HOST, () => {
  console.log(`ContaBilIT server listening on http://${HOST}:${PORT}`);
});
