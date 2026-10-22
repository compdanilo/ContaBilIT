// Automated API Test Suite for ContaBilIT
const BASE_URL = 'http://127.0.0.1:3000/api/v1';

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, message, details = '') {
  if (condition) {
    passed++;
    results.push(`  \x1b[32m✔ PASS\x1b[0m ${message}`);
  } else {
    failed++;
    results.push(`  \x1b[31m✖ FAIL\x1b[0m ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

async function runTests() {
  console.log('\n\x1b[34m========================================================\x1b[0m');
  console.log('\x1b[1m\x1b[33m   TESTE AUTOMATIZADO DAS APIS REST — CONTABILIT   \x1b[0m');
  console.log('\x1b[34m========================================================\x1b[0m\n');

  // ----------------------------------------------------
  // 1. AUTENTICAÇÃO
  // ----------------------------------------------------
  console.log('\x1b[36m[1/8] Testando Autenticação e Perfis (JWT)...\x1b[0m');

  // Login Admin
  const resAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contabilit.com.br', senha: 'admin123' })
  });
  const dataAdmin = await resAdmin.json();
  assert(resAdmin.status === 200 && dataAdmin.token && dataAdmin.papel === 'ADMIN', 'Login de Administrador com token JWT válido');
  const tokenAdmin = dataAdmin.token;

  // Login Contador
  const resContador = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'contador@contabilit.com.br', senha: 'contador123' })
  });
  const dataContador = await resContador.json();
  assert(resContador.status === 200 && dataContador.token && dataContador.papel === 'CONTADOR', 'Login de Contador com token JWT válido');
  const tokenContador = dataContador.token;

  // Login Cliente (Dev PJ)
  const resCliente = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cliente@empresa.com.br', senha: 'cliente123' })
  });
  const dataCliente = await resCliente.json();
  assert(resCliente.status === 200 && dataCliente.token && dataCliente.papel === 'CLIENTE' && dataCliente.clienteId === 1, 'Login de Cliente Dev PJ com escopo clienteId=1');
  const tokenCliente = dataCliente.token;

  // Login com senha inválida
  const resInvalido = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@contabilit.com.br', senha: 'senha_errada' })
  });
  assert(resInvalido.status === 401, 'Rejeição de credenciais incorretas (HTTP 401)');

  // ----------------------------------------------------
  // 2. DASHBOARD
  // ----------------------------------------------------
  console.log('\x1b[36m[2/8] Testando Dashboard e Métricas Consolidadas...\x1b[0m');

  const resDash = await fetch(`${BASE_URL}/dashboard`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const dataDash = await resDash.json();
  assert(
    resDash.status === 200 &&
    typeof dataDash.clientes === 'number' &&
    typeof dataDash.receitas === 'number' &&
    typeof dataDash.despesas === 'number',
    'Dashboard retorna consolidação fiscal de TI com receitas, despesas e saldo'
  );

  // Cliente não pode acessar dashboard geral
  const resDashCli = await fetch(`${BASE_URL}/dashboard`, {
    headers: { 'Authorization': `Bearer ${tokenCliente}` }
  });
  assert(resDashCli.status === 403, 'Acesso restrito ao Dashboard para o papel CLIENTE (HTTP 403 Forbidden)');

  // ----------------------------------------------------
  // 3. CLIENTES TECH
  // ----------------------------------------------------
  console.log('\x1b[36m[3/8] Testando Gestão de Clientes e Multi-inquilino...\x1b[0m');

  // Listar clientes como contador
  const resListCli = await fetch(`${BASE_URL}/clientes`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const clientes = await resListCli.json();
  assert(resListCli.status === 200 && Array.isArray(clientes) && clientes.length >= 2, 'Contador lista todos os clientes cadastrados');

  // Obter meu próprio cliente
  const resMeuCli = await fetch(`${BASE_URL}/clientes/me`, {
    headers: { 'Authorization': `Bearer ${tokenCliente}` }
  });
  const meuCli = await resMeuCli.json();
  assert(resMeuCli.status === 200 && meuCli.id === 1 && meuCli.tipo === 'PESSOA_JURIDICA', 'Cliente consulta apenas os próprios dados cadastrais (/clientes/me)');

  // Criar novo cliente tech
  const resNovoCli = await fetch(`${BASE_URL}/clientes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      nome: 'CloudDev Soluções em Nuvem Ltda',
      cpfCnpj: '44555666000199',
      email: 'contato@clouddev.tech',
      telefone: '11999998888',
      tipo: 'PESSOA_JURIDICA',
      ativo: true
    })
  });
  const novoCli = await resNovoCli.json();
  assert(resNovoCli.status === 201 && novoCli.id && novoCli.nome.includes('CloudDev'), 'Criação de novo cliente PJ Tech (HTTP 201 Created)');

  // Atualizar cliente
  const resAttCli = await fetch(`${BASE_URL}/clientes/${novoCli.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      nome: 'CloudDev Soluções & SRE Ltda',
      cpfCnpj: '44555666000199',
      email: 'contato@clouddev.tech',
      telefone: '11999998888',
      tipo: 'PESSOA_JURIDICA',
      ativo: true
    })
  });
  const attCli = await resAttCli.json();
  assert(resAttCli.status === 200 && attCli.nome === 'CloudDev Soluções & SRE Ltda', 'Atualização cadastral do cliente (HTTP 200 OK)');

  // ----------------------------------------------------
  // 4. COMPETÊNCIAS FISCAIS
  // ----------------------------------------------------
  console.log('\x1b[36m[4/8] Testando Competências Fiscais e RN de Unicidade...\x1b[0m');

  // Listar competências
  const resComps = await fetch(`${BASE_URL}/competencias`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const comps = await resComps.json();
  assert(resComps.status === 200 && Array.isArray(comps) && comps.length >= 3, 'Listagem de competências contábeis');

  // Detalhar competência
  const resCompDet = await fetch(`${BASE_URL}/competencias/1`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const compDet = await resCompDet.json();
  assert(
    resCompDet.status === 200 &&
    compDet.competencia &&
    Array.isArray(compDet.documentos) &&
    Array.isArray(compDet.lancamentos),
    'Detalhe completo de competência com documentos, lançamentos e pendências'
  );

  // Cliente acessa sua competência atual
  const resMinhaComp = await fetch(`${BASE_URL}/competencias/minha-atual`, {
    headers: { 'Authorization': `Bearer ${tokenCliente}` }
  });
  const minhaComp = await resMinhaComp.json();
  assert(resMinhaComp.status === 200 && minhaComp.competencia.cliente.id === 1, 'Cliente acessa competência corrente vinculada ao seu cadastro');

  // Criar nova competência (ex.: 11/2026 para o cliente recém criado)
  const resNovaComp = await fetch(`${BASE_URL}/competencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      clienteId: novoCli.id,
      ano: 2026,
      mes: 11
    })
  });
  const novaComp = await resNovaComp.json();
  assert(resNovaComp.status === 201 && novaComp.ano === 2026 && novaComp.mes === 11, 'Abertura de nova competência mensal (HTTP 201 Created)');

  // Teste de RN01: Duplicidade de competência (deve falhar com 400)
  const resCompDuplicada = await fetch(`${BASE_URL}/competencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      clienteId: novoCli.id,
      ano: 2026,
      mes: 11
    })
  });
  assert(resCompDuplicada.status === 400, 'RN01: Rejeição de competência duplicada no mesmo mês/ano (HTTP 400 Bad Request)');

  // ----------------------------------------------------
  // 5. DOCUMENTOS FISCAIS E UPLOAD
  // ----------------------------------------------------
  console.log('\x1b[36m[5/8] Testando Upload, Extração e Consulta de Documentos...\x1b[0m');

  // Listar documentos
  const resDocs = await fetch(`${BASE_URL}/documentos?competenciaId=1`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const docs = await resDocs.json();
  assert(resDocs.status === 200 && Array.isArray(docs), 'Consulta de documentos por competência');

  // Upload multipart de documento simulado
  const formData = new FormData();
  const mockFile = new Blob(['Conteudo simulado de NFS-e de Desenvolvimento de Software R$ 12.000,00 emitido em 12/10/2026'], { type: 'text/plain' });
  formData.append('files', mockFile, 'NFS-e_Software_API_Squad.pdf');

  const resUpload = await fetch(`${BASE_URL}/documentos/upload?clienteId=${novoCli.id}&competenciaId=${novaComp.id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenContador}` },
    body: formData
  });
  const uploadedDocs = await resUpload.json();
  assert(resUpload.status === 201 && Array.isArray(uploadedDocs) && uploadedDocs.length === 1, 'Upload e processamento de documento fiscal (HTTP 201 Created)');

  const docId = uploadedDocs[0].id;

  // Atualizar documento
  const resAttDoc = await fetch(`${BASE_URL}/documentos/${docId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      status: 'VALIDADO',
      observacao: 'Conferido com extrato bancário de TI'
    })
  });
  const attDoc = await resAttDoc.json();
  assert(resAttDoc.status === 200 && attDoc.status === 'VALIDADO', 'Atualização de status do documento pelo contador');

  // ----------------------------------------------------
  // 6. LANÇAMENTOS FINANCEIROS (RECEITAS E DESPESAS)
  // ----------------------------------------------------
  console.log('\x1b[36m[6/8] Testando Lançamentos Financeiros (NFS-e, Pró-labore, Faturas)...\x1b[0m');

  // Criar receita (NFS-e de software)
  const resRec = await fetch(`${BASE_URL}/lancamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      competenciaId: novaComp.id,
      tipo: 'RECEITA',
      descricao: 'NFS-e 501: Desenvolvimento de Microsserviços e Arquitetura Cloud',
      valor: 20000.00,
      vencimento: '2026-11-15',
      pago: true
    })
  });
  const rec = await resRec.json();
  assert(resRec.status === 201 && rec.tipo === 'RECEITA' && rec.valor === 20000, 'Lançamento de Receita Tech (HTTP 201 Created)');

  // Criar despesa (Pró-labore para Fator R)
  const resDesp = await fetch(`${BASE_URL}/lancamentos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      competenciaId: novaComp.id,
      tipo: 'DESPESA',
      descricao: 'Pró-labore Sócios (Enquadramento Fator R 28%)',
      valor: 5600.00,
      vencimento: '2026-11-05',
      pago: true
    })
  });
  const desp = await resDesp.json();
  assert(resDesp.status === 201 && desp.tipo === 'DESPESA' && desp.valor === 5600, 'Lançamento de Despesa Pró-labore / Fator R (HTTP 201 Created)');

  // Listar lançamentos da competência
  const resListLanc = await fetch(`${BASE_URL}/lancamentos?competenciaId=${novaComp.id}`, {
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const lancs = await resListLanc.json();
  assert(resListLanc.status === 200 && lancs.length >= 2, 'Listagem de lançamentos da competência');

  // ----------------------------------------------------
  // 7. PENDÊNCIAS FISCAIS
  // ----------------------------------------------------
  console.log('\x1b[36m[7/8] Testando Ciclo de Pendências e Resoluções...\x1b[0m');

  // Criar pendência
  const resNovaPend = await fetch(`${BASE_URL}/pendencias`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      competenciaId: novaComp.id,
      documentoId: docId,
      tipo: 'INFORMACAO_NECESSARIA',
      descricao: 'Favor anexar comprovante de liquidação cambial do contrato em moeda estrangeira.'
    })
  });
  const novaPend = await resNovaPend.json();
  assert(resNovaPend.status === 201 && novaPend.status === 'ABERTA', 'Registro de pendência fiscal (HTTP 201 Created)');

  // Atualizar status da pendência para RESOLVIDA
  const resAttPend = await fetch(`${BASE_URL}/pendencias/${novaPend.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({ status: 'RESOLVIDA' })
  });
  const attPend = await resAttPend.json();
  assert(resAttPend.status === 200 && attPend.status === 'RESOLVIDA', 'Resolução de pendência contábil (HTTP 200 OK)');

  // ----------------------------------------------------
  // 8. RELATÓRIO DE FECHAMENTO & VALIDAÇÃO HUMANA
  // ----------------------------------------------------
  console.log('\x1b[36m[8/8] Testando Relatório de Fechamento e Supervisão Humana...\x1b[0m');

  // Gerar relatório
  const resGerarRel = await fetch(`${BASE_URL}/relatorios/competencias/${novaComp.id}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${tokenContador}` }
  });
  const relGerado = await resGerarRel.json();
  assert(resGerarRel.status === 201 && relGerado.status === 'GERADO', 'Geração de relatório contábil de fechamento (HTTP 201 Created)');

  // Validar relatório
  const resValRel = await fetch(`${BASE_URL}/relatorios/${relGerado.id}/validar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenContador}`
    },
    body: JSON.stringify({
      observacoes: 'Competência conferida: apuração com Fator R atendido (28%) e tributação no Anexo III.'
    })
  });
  const relValidado = await resValRel.json();
  assert(resValRel.status === 200 && relValidado.status === 'VALIDADO', 'Aprovação formal do relatório pelo contador (HTTP 200 OK)');

  // Limpeza do cliente de teste
  await fetch(`${BASE_URL}/clientes/${novoCli.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });

  // ----------------------------------------------------
  // RELATÓRIO FINAL
  // ----------------------------------------------------
  console.log('\n\x1b[34m--------------------------------------------------------\x1b[0m');
  console.log('\x1b[1mRESULTADO DETALHADO DOS TESTES:\x1b[0m');
  console.log(results.join('\n'));
  console.log('\x1b[34m--------------------------------------------------------\x1b[0m');

  if (failed === 0) {
    console.log(`\n\x1b[1m\x1b[32m✔ TODOS OS ${passed} TESTES PASSARAM COM SUCESSO!\x1b[0m\n`);
  } else {
    console.log(`\n\x1b[1m\x1b[31m✖ FALHAS DETECTADAS: ${failed} falhas de ${passed + failed} testes executados.\x1b[0m\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('\x1b[31mErro fatal ao executar testes de API:\x1b[0m', err);
  process.exit(1);
});
