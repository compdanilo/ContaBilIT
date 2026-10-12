# ContaBilIT — Documentação Técnica e de Negócio (v1.0)

Este documento reúne a especificação funcional completa, as regras de negócio fiscais voltadas para o setor de Tecnologia da Informação (TI) e a referência técnica das APIs REST do sistema **ContaBilIT**.

---

## 1. Visão Geral do Sistema

O **ContaBilIT** é uma plataforma de gestão e automação contábil desenhada especialmente para:
* **Desenvolvedores PJ** (Full Stack, Backend, Frontend, Mobile);
* **Engenheiros de Dados e DevOps / SRE**;
* **Consultores e Arquitetos de Software**;
* **Startups e Empresas de Tecnologia**.

A plataforma resolve o atrito entre o desenvolvedor (que precisa emitir NFS-e, recolher DAS, emitir invoices internacionais e gerenciar pró-labore) e o escritório de contabilidade (que precisa conciliar extratos, verificar alíquotas e cumprir obrigações acessórias sem retrabalho manual).

---

## 2. Particularidades Fiscais e Contábeis de TI

### 2.1. O Fator R no Simples Nacional
O desenvolvimento de software (CNAE 6201-5/01) e a consultoria em TI (CNAE 6202-3/00) estão sujeitos ao **Fator R** da Lei Complementar nº 123/2006:

$$\text{Fator R} = \frac{\text{Folha de Salários e Pró-labore dos últimos 12 meses}}{\text{Receita Bruta Total dos últimos 12 meses}}$$

* **Se Fator R $\ge$ 28%**: Tributação pelo **Anexo III** $\rightarrow$ Alíquota inicial de **6,0%**.
* **Se Fator R $<$ 28%**: Tributação pelo **Anexo V** $\rightarrow$ Alíquota inicial de **15,5%** (aumento de mais de 150% na carga tributária).
* **Função no ContaBilIT**: Alerta preventivo na competência mensal para que o pró-labore lançado atinja o valor mínimo de enquadramento no Anexo III antes da emissão do DAS.

### 2.2. Exportação de Serviços (Invoices para o Exterior)
Para profissionais de TI que prestam serviço para empresas estrangeiras (EUA, Europa, contratos remotos via Deel, Wise, Payoneer):
* **Benefício Fiscal**: Não incidência de **PIS**, **COFINS** e **ISS** quando o resultado da prestação de serviços se verifica no exterior.
* **Exigência Legal**: O invoice deve ter lastro no **Contrato de Câmbio / Comprovante de Liquidação Bancária** em moeda nacional (BRL).
* **Tratamento no Sistema**: Bloqueio de encerramento da competência até a vinculação do comprovante de câmbio ao invoice.

### 2.3. Despesas Operacionais e Ferramentas Tech
Conciliação e escrituração de custos comuns em tecnologia:
* Provedores de Cloud: AWS, Google Cloud Platform, Microsoft Azure, DigitalOcean, Cloudflare.
* Licenças e Ferramentas: GitHub Enterprise, JetBrains, Figma, OpenAI API, Vercel, Datadog.
* Guias de Arrecadação: DAS (Simples Nacional), GPS/INSS e DARF sobre pró-labore.

---

## 3. Entidades do Domínio e Ciclos de Vida

### 3.1. Cliente (Pessoa Jurídica ou Física)
* Cadastro da empresa de TI com CNPJ/CPF, razão social, e-mail, telefone e indicador de ativo.

### 3.2. Competência Mensal
* Representa o mês fiscal (ex.: `10/2026`).
* **Regra de Unicidade**: Apenas 1 competência por cliente para cada par `(ano, mes)`.
* **Estados**:
  1. `ABERTA`: Período aberto para uploads e recebimento de notas fiscais.
  2. `EM_PROCESSAMENTO`: Arquivos em extração determinística e validação.
  3. `AGUARDANDO_VALIDACAO`: Relatório gerado; aguardando revisão do contador.
  4. `PENDENTE`: Inconsistências apontadas que exigem correção pelo cliente ou contador.
  5. `VALIDADA`: Aprovada formalmente pelo contador.
  6. `ENCERRADA`: Fechada definitivamente com registro do timestamp `fechadaEm`.

### 3.3. Documento Fiscal
* Arquivos enviados com extração direta de metadados:
  * **XML (NF-e/NFS-e)**: Extração das tags `<vNF>`, `<dhEmi>` e chave de acesso `<infNFe Id>`.
  * **PDF com texto**: Extração via Apache PDFBox procurando padrões de valor e data brasileira.
* **Estados**: `RECEBIDO` $\rightarrow$ `EM_ANALISE` / `PENDENTE` $\rightarrow$ `VALIDADO`.

### 3.4. Lançamento Financeiro
* Registro de `RECEITA` ou `DESPESA`, descrição, valor monetário, data de vencimento e status de liquidação (`pago`).

### 3.5. Pendência
* Apontamentos de irregularidades (`DOCUMENTO_AUSENTE`, `DOCUMENTO_INCONSISTENTE`, `DADO_INVALIDO`, `INFORMACAO_NECESSARIA`).
* **Estados**: `ABERTA` $\rightarrow$ `EM_ANALISE` $\rightarrow$ `RESOLVIDA` (ou `CANCELADA`).

### 3.6. Relatório de Fechamento
* Sintetiza o balanço da competência (total de receitas, despesas, saldo, documentos validados e pendências pendentes).
* **Estados**: `GERADO` $\rightarrow$ `EM_REVISAO` $\rightarrow$ `VALIDADO` / `DEVOLVIDO` $\rightarrow$ `FINALIZADO`.

---

## 4. Regras de Negócio Fundamentais (RN)

* **RN01 — Unicidade de Competência**: Não é permitido cadastrar mais de uma competência para o mesmo cliente no mesmo mês e ano.
* **RN02 — Validação Determinística**: Sem dependência de OCR probabilístico. Documentos sem data ou valor identificáveis geram pendência imediata de preenchimento.
* **RN03 — Controle de Acesso e Perfis (RBAC)**:
  * `ADMIN`: Acesso global a todas as entidades e gestão de usuários (`/usuarios`).
  * `CONTADOR`: Acesso às rotinas contábeis de todos os clientes; sem permissão de criar/excluir usuários administradores.
  * `CLIENTE`: Restrito exclusivamente aos seus próprios documentos, competências e relatórios. Tentativas de acessar dados de outros clientes disparam HTTP 403 Forbidden.
* **RN04 — Supervisão Humana Obrigatória**: Nenhuma competência é encerrada sem a validação formal de um usuário com perfil `CONTADOR` ou `ADMIN`.
* **RN05 — Isolamento do Armazenamento**: Arquivos binários são gravados em disco isolado (`./storage`) com nomes UUID sanitizados. O banco de dados armazena apenas metadados e caminhos relativos.

---

## 5. Especificação Completa das APIs REST (`/api/v1`)

Cabeçalho de autenticação obrigatório em todas as rotas protegidas:
```http
Authorization: Bearer <TOKEN_JWT>
```

### 5.1. Autenticação
* `POST /api/v1/auth/login`: Autentica usuário e retorna JWT com papel e ID do cliente vinculado.

### 5.2. Usuários (Acesso: `ADMIN`)
* `GET /api/v1/usuarios`: Lista todos os usuários do sistema.
* `POST /api/v1/usuarios`: Cria novo operador (`ADMIN`, `CONTADOR` ou `CLIENTE`).
* `DELETE /api/v1/usuarios/{id}`: Exclui o usuário especificado.

### 5.3. Clientes
* `GET /api/v1/clientes`: Lista empresas de TI cadastradas (`ADMIN`, `CONTADOR`).
* `GET /api/v1/clientes/me`: Retorna dados da própria empresa (`CLIENTE`).
* `POST /api/v1/clientes`: Cadastra nova empresa de TI (`ADMIN`, `CONTADOR`).
* `PUT /api/v1/clientes/{id}`: Atualiza cadastro (`ADMIN`, `CONTADOR`).
* `DELETE /api/v1/clientes/{id}`: Exclui cliente (`ADMIN`, `CONTADOR`).

### 5.4. Competências
* `GET /api/v1/competencias`: Lista competências (`?clienteId=X` opcional).
* `GET /api/v1/competencias/{id}`: Retorna visão detalhada com documentos, lançamentos, pendências e relatório.
* `GET /api/v1/competencias/minha-atual`: Retorna a competência corrente do cliente autenticado.
* `POST /api/v1/competencias`: Abre competência mensal para um cliente.
* `PUT /api/v1/competencias/{id}/status`: Altera status da competência (`ABERTA`, `ENCERRADA`, etc.).

### 5.5. Documentos
* `GET /api/v1/documentos`: Lista documentos com filtro opcional por `?competenciaId=X`.
* `POST /api/v1/documentos/upload?clienteId=X&competenciaId=Y`: Upload multipart de NFS-e, invoices e comprovantes.
* `PUT /api/v1/documentos/{id}`: Atualiza status do documento (`VALIDADO`, `PENDENTE`, etc.).
* `GET /api/v1/documentos/{id}/arquivo`: Download seguro do binário original.

### 5.6. Lançamentos
* `GET /api/v1/lancamentos`: Lista lançamentos financeiros (`?competenciaId=X` opcional).
* `POST /api/v1/lancamentos`: Cria lançamento de receita ou despesa.
* `PUT /api/v1/lancamentos/{id}`: Atualiza lançamento.
* `DELETE /api/v1/lancamentos/{id}`: Remove lançamento.

### 5.7. Pendências
* `GET /api/v1/pendencias`: Lista pendências (`?competenciaId=X` e `?status=Y` opcionais).
* `POST /api/v1/pendencias`: Registra nova pendência.
* `PUT /api/v1/pendencias/{id}/status`: Altera status da pendência (`RESOLVIDA`, `EM_ANALISE`, etc.).

### 5.8. Relatórios e Fechamento
* `GET /api/v1/relatorios`: Lista relatórios de fechamento.
* `POST /api/v1/relatorios/competencias/{competenciaId}`: Gera relatório de fechamento da competência.
* `POST /api/v1/relatorios/{id}/validar`: Contador valida e aprova o fechamento contábil.
* `POST /api/v1/relatorios/{id}/devolver`: Contador devolve para correção com criação opcional de pendência.

### 5.9. Dashboard (Acesso: `ADMIN`, `CONTADOR`)
* `GET /api/v1/dashboard`: Retorna indicadores consolidados de clientes, documentos recebidos, receitas tech e despesas.

---

## 6. Códigos de Retorno HTTP Padrão
* **200 OK**: Consulta ou operação concluída com sucesso.
* **201 Created**: Recurso criado com sucesso.
* **204 No Content**: Exclusão bem-sucedida sem conteúdo no corpo.
* **400 Bad Request**: Regra de negócio violada ou JSON inválido.
* **401 Unauthorized**: Falha de autenticação ou token expirado.
* **403 Forbidden**: Tentativa de acesso a recurso sem a permissão necessária.
* **404 Not Found**: Identificador não encontrado.
* **500 Internal Server Error**: Erro inesperado de execução.
