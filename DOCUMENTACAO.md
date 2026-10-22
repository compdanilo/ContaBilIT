# ContaBilIT — Documentação Técnica, Regras de Negócio e APIs (v1.0)

> **Documento Unificado de Especificação de Negócio, Regras Fiscais e Referência Técnica da API REST.**

---

## 1. Visão Geral do Sistema

O **ContaBilIT** é uma plataforma de gestão e automação contábil desenhada especialmente para o ecossistema de **Tecnologia da Informação (TI)**:
* **Desenvolvedores de Software PJ** (Full Stack, Backend, Frontend, Mobile);
* **Engenheiros de Dados e DevOps / SRE**;
* **Consultores e Arquitetos de Soluções Cloud**;
* **Startups e Empresas de Serviços de Tecnologia**.

A plataforma resolve o atrito entre o desenvolvedor (que precisa emitir NFS-e, recolher DAS, emitir invoices internacionais e gerenciar pró-labore) e o escritório de contabilidade (que precisa conciliar extratos, verificar alíquotas e cumprir obrigações acessórias sem retrabalho manual).

### 1.1. Proposta de Valor
* **Automação de Rotinas Repetitivas**: Extração direta de dados de NFS-e (XML/PDF) e faturas de infraestrutura em nuvem.
* **Inteligência Tributária Preventiva**: Auditoria contínua da meta de 28% do **Fator R** para manter a empresa tributada no **Anexo III (alíquota a partir de 6%)** do Simples Nacional, evitando o Anexo V (15,5%+).
* **Supervisão Humana Especializada**: Nenhuma competência contábil é fechada sem validação e assinatura formal do contador.

---

## 2. Particularidades Fiscais e Contábeis do Setor de TI

### 2.1. O Mecanismo do Fator R (Simples Nacional)
O desenvolvimento de software (CNAE 62.01-5/01) e a consultoria em TI (CNAE 62.02-3/00) estão originalmente vinculados ao **Anexo V** do Simples Nacional (com alíquotas iniciais de **15,5%**).

Pelo dispositivo do **Fator R** (Art. 18, § 5º-J da Lei Complementar nº 123/2006):

$$\text{Fator R} = \frac{\text{Massa Salarial dos últimos 12 meses (incluindo Pró-labore + Encargos)}}{\text{Receita Bruta Total dos últimos 12 meses}}$$

* **Se Fator R $\ge$ 28% (0,28)**: A empresa migra para o **Anexo III**, reduzindo a alíquota inicial para **6,0%** sobre as NFS-e emitidas (economia de mais de 60% na carga de impostos).
* **Se Fator R $<$ 28%**: A empresa permanece no **Anexo V** (15,5%+).
* **Função no ContaBilIT**: Emite alertas e calcula o valor ideal de pró-labore na competência antes do fechamento do DAS.

### 2.2. Exportação de Serviços de TI (Invoices & Remessas do Exterior)
Para profissionais contratados por empresas no exterior (EUA, Europa, via Deel, Wise, Payoneer):
* **Não Incidência Fiscal**: A legislação brasileira prevê a **isenção de PIS, COFINS e ISS** sobre a receita de exportação de serviços de tecnologia cujo resultado se verifique fora do Brasil.
* **Exigência Legal de Lastro**: A Receita Federal exige o cruzamento estrito entre o **Invoice emitido** e o **Contrato de Câmbio / Liquidação Bancária** em moeda nacional (BRL).
* **Tratamento no Sistema**: Bloqueio de encerramento da competência até a vinculação do comprovante de câmbio ao respectivo invoice.

### 2.3. Custos e Despesas Operacionais de TI
Categorização e conciliação de custos dedutíveis ou operacionais típicos de tecnologia:
* **Infraestrutura Cloud**: Amazon Web Services (AWS), Google Cloud Platform (GCP), Microsoft Azure, DigitalOcean, Cloudflare.
* **Ferramentas SaaS & Licenças**: GitHub Enterprise, JetBrains, Figma, OpenAI API, Vercel, Datadog.
* **Guias Tributárias**: DAS Simples Nacional, GPS/INSS e DARF sobre o pró-labore.

---

## 3. Entidades do Domínio e Ciclos de Vida

### 3.1. Cliente
Representa a empresa de TI (Pessoa Jurídica) ou o profissional autônomo (Pessoa Física).
* **Campos principais**: `id`, `nome`, `cpfCnpj`, `email`, `telefone`, `tipo` (`PESSOA_JURIDICA` / `PESSOA_FISICA`), `ativo`, `criadoEm`.

### 3.2. Competência Mensal
Representa o mês de apuração contábil e fiscal de determinado cliente (ex.: `10/2026`).
* **Chave Composta Lógica**: `(cliente_id, ano, mes)`.
* **Máquina de Estados**:
  ```
  [ABERTA] ──(recebimento de docs)──> [EM_PROCESSAMENTO]
     │
     └──(geração de relatório)───────> [AGUARDANDO_VALIDACAO]
                                              │
                     ┌────────────────────────┴────────────────────────┐
                     ▼                                                 ▼
                [VALIDADA]                                         [PENDENTE]
                     │                                                 │
                     ▼                                                 │
                [ENCERRADA] <──────(resolução das pendências)──────────┘
  ```
  * `ABERTA`: Período aberto para envio de NFS-e, comprovantes e despesas.
  * `EM_PROCESSAMENTO`: Arquivos em análise de integridade e extração de dados.
  * `AGUARDANDO_VALIDACAO`: Relatório financeiro e fiscal gerado; aguardando revisão do contador.
  * `PENDENTE`: Apontada inconsistência (ex.: Fator R abaixo da meta, invoice sem contrato de câmbio).
  * `VALIDADA`: Aprovada formalmente pelo contador responsável.
  * `ENCERRADA`: Competência fechada com registro do timestamp de encerramento (`fechadaEm`).

### 3.3. Documento Fiscal
Arquivo fiscal enviado para uma competência específica.
* **Tipos**: `NOTA_FISCAL` (NFS-e de software), `RECIBO` (Invoices/recibos), `COMPROVANTE` (DAS, DARF, GPS), `DOCUMENTO_FISCAL` (Faturas cloud/SaaS), `OUTRO`.
* **Máquina de Estados**:
  * `RECEBIDO`: Arquivo salvo no storage, aguardando validação.
  * `EM_ANALISE`: Encontrada potencial inconsistência ou duplicidade de identificador fiscal.
  * `PENDENTE`: Ausência de dados fundamentais (sem valor ou sem data identificável).
  * `VALIDADO`: Conferido e conciliado com as regras do sistema.

### 3.4. Lançamento Financeiro
Registro contábil de receitas e despesas vinculadas à competência.
* **Campos**: `id`, `competenciaId`, `tipo` (`RECEITA` / `DESPESA`), `descricao`, `valor`, `vencimento`, `pago`.

### 3.5. Pendência
Inconsistência apontada pelo motor de validação determinística ou pelo contador.
* **Tipos**: `DOCUMENTO_AUSENTE`, `DOCUMENTO_INCONSISTENTE`, `COMPETENCIA_INCORRETA`, `DADO_INVALIDO`, `DOCUMENTO_DUPLICADO`, `INFORMACAO_NECESSARIA`, `OUTRO`.
* **Status**: `ABERTA` → `EM_ANALISE` → `RESOLVIDA` (ou `CANCELADA`).

### 3.6. Relatório de Fechamento
Consolidação sintética gerada para homologação do contador.
* **Métricas**: Total de receitas tech, total de despesas, saldo operacional, contagem de documentos validados e pendências pendentes de resolução.
* **Status**: `GERADO` → `EM_REVISAO` → `VALIDADO` / `DEVOLVIDO` → `FINALIZADO`.

---

## 4. Catálogo de Regras de Negócio (RN)

### RN01 — Unicidade de Competência Mensal por Cliente
* Um cliente só pode possuir **uma única competência para o mesmo ano e mês**.
* Tentativas de cadastrar uma competência duplicada disparam HTTP 400 (`IllegalStateException: Já existe uma competência MM/AAAA para este cliente`).

### RN02 — Validação Determinística de Documentos Fiscais
* O sistema não utiliza OCR probabilístico nem IA não-determinística para extrair dados fiscais.
* **XML de NF-e**: Parse estruturado da árvore DOM procurando rigorosamente pelas tags `<vNF>`, `<dhEmi>` / `<dEmi>` e atributo `Id` de `<infNFe>`.
* **PDF com Camada de Texto**: Extração com Apache PDFBox varrendo expressões regulares de valores monetários (`R$ X.XXX,XX`) e datas no padrão brasileiro (`DD/MM/AAAA`).
* Documentos sem data ou valor são classificados como `PENDENTE`, gerando automaticamente uma pendência do tipo `INFORMACAO_NECESSARIA`.
* Documentos com identificador já existente dentro da mesma competência são marcados como `EM_ANALISE` por suspeita de duplicidade (`DOCUMENTO_INCONSISTENTE`).

### RN03 — Isolamento Multi-inquilino e Perfis de Acesso (RBAC)
* A segurança é implementada a nível de aplicação e repositório, não apenas na interface gráfica:
  * **ADMIN**: Pode gerenciar qualquer entidade, criar usuários do sistema e excluir registros.
  * **CONTADOR**: Acesso total de leitura e escrita às rotinas contábeis de todos os clientes, mas sem acesso à gestão de credenciais administrativas (`/api/v1/usuarios`).
  * **CLIENTE**: Só pode visualizar clientes a que pertence (`/api/v1/clientes/me`). Não pode visualizar competências, documentos ou relatórios de outros clientes; qualquer tentativa em rota de ID alheio retorna HTTP 403 (`AccessDeniedException`).

### RN04 — Regra de Encerramento e Auditoria Humana
* Uma competência **nunca é encerrada automaticamente**.
* O encerramento requer que o relatório seja formalmente validado por um usuário com papel `ADMIN` ou `CONTADOR`.
* Se o relatório for devolvido (`POST /api/v1/relatorios/{id}/devolver`), a competência transita obrigatoriamente para `PENDENTE` e uma nova pendência explicativa é inserida.

### RN05 — Armazenamento Físico Seguro de Arquivos
* O banco de dados guarda apenas o metadado e o nome de arquivo normalizado com UUID (`<uuid>.<extensao>`).
* Os arquivos binários residem no disco isolado (`./storage`), impedindo sobrecarga do banco de dados relacional.
* O download (`GET /api/v1/documentos/{id}/arquivo`) confere a posse do documento antes de servir o fluxo de bytes.

---

## 5. Especificação Completa das APIs REST (`/api/v1`)

Todos os endpoints utilizam formato **JSON** e autenticação via cabeçalho HTTP:
```http
Authorization: Bearer <seu_token_jwt>
```

---

### 5.1. Autenticação

#### `POST /api/v1/auth/login`
Autentica o usuário e retorna o token JWT de sessão.
* **Acesso**: Público
* **Request Body**:
  ```json
  {
    "email": "contador@contabilit.com.br",
    "senha": "contador123"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "nome": "Carlos Contador",
    "email": "contador@contabilit.com.br",
    "papel": "CONTADOR",
    "clienteId": null
  }
  ```

---

### 5.2. Usuários

#### `GET /api/v1/usuarios`
Lista todos os operadores e usuários cadastrados.
* **Acesso**: `ADMIN`
* **Response (200 OK)**: Lista de `UsuarioResponse`.

#### `POST /api/v1/usuarios`
Cadastra um novo usuário no sistema.
* **Acesso**: `ADMIN`
* **Request Body**:
  ```json
  {
    "nome": "Danilo Dev",
    "email": "danilo@dev.tech",
    "senha": "senhaSegura123",
    "papel": "CLIENTE",
    "clienteId": 1
  }
  ```
* **Response (201 Created)**: Dados do usuário criado com senha ofuscada.

#### `DELETE /api/v1/usuarios/{id}`
Remove o usuário informado.
* **Acesso**: `ADMIN`
* **Response (204 No Content)**

---

### 5.3. Clientes

#### `GET /api/v1/clientes`
Lista todas as empresas de TI e clientes cadastrados.
* **Acesso**: `ADMIN`, `CONTADOR`

#### `GET /api/v1/clientes/me`
Retorna as informações do cliente vinculado ao usuário logado.
* **Acesso**: `CLIENTE`

#### `POST /api/v1/clientes`
Cadastra uma nova empresa de tecnologia.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "nome": "Danilo Silva Software & Cloud Ltda",
    "cpfCnpj": "12345678000195",
    "email": "contato@danilosoftware.tech",
    "telefone": "11987654321",
    "tipo": "PESSOA_JURIDICA",
    "ativo": true
  }
  ```
* **Response (201 Created)**: Objeto do cliente persistido com `id` e timestamp.

#### `PUT /api/v1/clientes/{id}`
Atualiza os dados cadastrais da empresa de tecnologia.
* **Acesso**: `ADMIN`, `CONTADOR`

#### `DELETE /api/v1/clientes/{id}`
Remove o cliente informado.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Response (204 No Content)**

---

### 5.4. Competências

#### `GET /api/v1/competencias`
Lista as competências com filtros opcionais.
* **Acesso**: `ADMIN`, `CONTADOR` (todas ou filtradas por `?clienteId=X`), `CLIENTE` (apenas as próprias).

#### `GET /api/v1/competencias/{id}`
Retorna a visualização detalhada da competência (incluindo lista de documentos, lançamentos, pendências e relatório).
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (se pertencer ao seu cadastro).

#### `GET /api/v1/competencias/minha-atual`
Retorna os dados da competência mais recente do cliente logado.
* **Acesso**: `CLIENTE`

#### `POST /api/v1/competencias`
Abre uma nova competência contábil mensal para o cliente.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "clienteId": 1,
    "ano": 2026,
    "mes": 10
  }
  ```
* **Response (201 Created)**

#### `PUT /api/v1/competencias/{id}/status`
Atualiza manualmente o status da competência.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "status": "ENCERRADA"
  }
  ```

---

### 5.5. Documentos

#### `GET /api/v1/documentos`
Lista documentos fiscais com filtro opcional por competência (`?competenciaId=X`).
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (com filtro de escopo).

#### `POST /api/v1/documentos/upload?clienteId=X&competenciaId=Y`
Recebe um lote de arquivos (NFS-e, invoices, PDFs de DAS) em `multipart/form-data`.
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (apenas para o seu próprio `clienteId`).
* **Response (201 Created)**: Lista de documentos processados com valores e status extraídos.

#### `PUT /api/v1/documentos/{id}`
Atualiza o status de validação ou adiciona observações do contador sobre o documento.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "status": "VALIDADO",
    "observacao": "CNAE 62.01-5-01 e alíquota de ISS retido conferidos."
  }
  ```

#### `GET /api/v1/documentos/{id}/arquivo`
Efetua o download seguro do arquivo original armazenado no storage.
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (se o arquivo pertencer ao cliente).
* **Headers de Resposta**: `Content-Disposition: attachment; filename="..."`.

---

### 5.6. Lançamentos

#### `GET /api/v1/lancamentos`
Lista os lançamentos financeiros vinculados a competências.
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (escopo restrito).

#### `POST /api/v1/lancamentos`
Registra uma receita ou despesa na competência.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "competenciaId": 2,
    "tipo": "RECEITA",
    "descricao": "NFS-e 402: Engenharia de Software e Squad Tech",
    "valor": 18200.00,
    "vencimento": "2026-10-05",
    "pago": true
  }
  ```

#### `DELETE /api/v1/lancamentos/{id}`
Exclui um lançamento financeiro.
* **Acesso**: `ADMIN`, `CONTADOR`

---

### 5.7. Pendências

#### `GET /api/v1/pendencias`
Lista pendências com filtros opcionais por `?competenciaId=X` e `?status=Y`.
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (escopo restrito).

#### `POST /api/v1/pendencias`
Registra uma nova pendência para resolução pelo cliente ou contador.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "competenciaId": 2,
    "documentoId": 4,
    "tipo": "INFORMACAO_NECESSARIA",
    "descricao": "Pendente anexar o contrato de câmbio / liquidação da remessa internacional em USD (Deel)."
  }
  ```

#### `PUT /api/v1/pendencias/{id}/status`
Altera o status de uma pendência (`ABERTA`, `EM_ANALISE`, `RESOLVIDA`, `CANCELADA`).
* **Acesso**: `ADMIN`, `CONTADOR`

---

### 5.8. Relatórios e Fechamento

#### `GET /api/v1/relatorios`
Lista todos os relatórios consolidados gerados.
* **Acesso**: `ADMIN`, `CONTADOR`, `CLIENTE` (escopo restrito).

#### `POST /api/v1/relatorios/competencias/{competenciaId}`
Gera a consolidação da competência e transita seu status para `AGUARDANDO_VALIDACAO`.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Response (201 Created)**: Objeto `RelatorioResponse` com totais consolidados.

#### `POST /api/v1/relatorios/{id}/validar`
Aprova formalmente o relatório e coloca a competência em status `VALIDADA`.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "observacoes": "Apuração Simples Nacional conferida com Fator R atingido (28,5%)."
  }
  ```

#### `POST /api/v1/relatorios/{id}/devolver`
Devolve o relatório por inconsistência e transita a competência para `PENDENTE`.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Request Body**:
  ```json
  {
    "observacoes": "Valor do pró-labore lançado não atinge a meta do Fator R.",
    "criarPendencia": true,
    "tipoPendencia": "DADO_INVALIDO",
    "descricaoPendencia": "Ajustar valor do pró-labore para pelo menos R$ 5.096,00."
  }
  ```

---

### 5.9. Dashboard

#### `GET /api/v1/dashboard`
Retorna métricas consolidadas em tempo real para a equipe contábil.
* **Acesso**: `ADMIN`, `CONTADOR`
* **Response (200 OK)**:
  ```json
  {
    "clientes": 2,
    "competenciasAbertas": 1,
    "competenciasAguardandoValidacao": 0,
    "competenciasValidadas": 1,
    "competenciasComPendencias": 1,
    "totalDocumentos": 5,
    "pendenciasAbertas": 2,
    "receitas": 34700.00,
    "despesas": 7390.00,
    "saldo": 27310.00
  }
  ```

---

## 6. Códigos de Status HTTP e Tratamento de Erros

A API adota o padrão unificado de resposta para cenários de exceção:

```json
{
  "status": 400,
  "message": "Descrição amigável da validação ou regra violada."
}
```

| Código | Significado | Exemplo de Ocorrência |
|---|---|---|
| **200 OK** | Sucesso na requisição | Consulta realizada ou status alterado |
| **201 Created** | Recurso criado | Cadastro de cliente, abertura de competência, upload de arquivo |
| **204 No Content** | Sucesso sem corpo | Exclusão de cliente, usuário ou lançamento |
| **400 Bad Request** | Erro de validação ou regra de negócio | Competência duplicada, campos obrigatórios ausentes |
| **401 Unauthorized** | Falha de autenticação | Token JWT ausente, expirado ou inválido |
| **403 Forbidden** | Permissão insuficiente | Usuário `CLIENTE` tentando acessar dados de outro cliente |
| **404 Not Found** | Recurso não localizado | ID de cliente ou competência inexistente |
| **500 Internal Server Error** | Erro não tratado | Falha de I/O de disco ou erro de banco de dados |
