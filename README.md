# ContabilIT — v0.3

> Facilite sua vida contábil.

Produto da BuritiT Solutions: automação do trabalho operacional/repetitivo da
contabilidade para autônomos e profissionais liberais, com validação humana do contador.

Fluxo: **Cliente → Competência → Documentos/Lançamentos → Validações → Pendências → Relatório → Revisão do contador → Validado/Devolvido**.

## Novidades da v0.3

1. **Autenticação por papel** (ADMIN / CONTADOR / CLIENTE) via JWT stateless. CLIENTE só
   enxerga e opera os próprios dados (escopo aplicado no backend, não só escondido na tela).
2. **Extração real de dados do documento** — sem OCR/IA: XML de NF-e é lido como XML
   estruturado (valor, data, chave de acesso); PDFs com camada de texto têm o texto
   extraído (Apache PDFBox) e varrido por padrões de valor/data. Documentos sem texto
   extraível (ex.: imagem escaneada) seguem para revisão manual, como já acontecia.
3. **Storage separado do banco** — arquivos vão para disco (`./storage` por padrão), o
   banco guarda só o caminho. Endpoint de download: `GET /documentos/{id}/arquivo`.

## Stack

Angular 20 (standalone components) + Spring Boot 3.5 / Java 17 + H2 + Spring Security (JWT) + PDFBox. API REST versionada em `/api/v1`.

## Executar backend

Requer Java 17+ (LTS) e Maven.

```bash
cd backend
mvn clean spring-boot:run
```

No primeiro start, se não houver nenhum usuário no banco, um administrador padrão é
criado automaticamente (ver log de inicialização):

```
admin@contabilit.com.br / admin123
```

**Troque essa senha em produção.** Com esse login, o ADMIN pode criar os demais usuários
(CONTADOR e CLIENTE) em `/usuarios` — um usuário CLIENTE precisa estar vinculado a um
`Cliente` já cadastrado.

Configurações relevantes em `application.properties` (ou variáveis de ambiente):
- `app.cors.allowed-origins` — origem do frontend (padrão `http://localhost:4200`)
- `app.jwt.secret` (`APP_JWT_SECRET`) — segredo de assinatura do token (32+ caracteres)
- `app.jwt.expiracao-ms` — validade do token (padrão 8h)
- `app.storage.path` — pasta onde os arquivos enviados são salvos (padrão `./storage`)

## Executar frontend

Requer Node.js/npm.

```bash
cd frontend
npm install
npm start
```

Acesse `http://localhost:4200` e faça login com o admin padrão (ou um usuário criado por ele).

Para build de produção (usa `environment.prod.ts`, com `apiUrl` relativo `/api/v1`):

```bash
npm run build
```

## Domínio

```
Cliente
 └── Competencia (ano/mês; ABERTA → EM_PROCESSAMENTO → AGUARDANDO_VALIDACAO → VALIDADA/PENDENTE → ENCERRADA)
      ├── Documento (RECEBIDO → EM_ANALISE/PENDENTE → VALIDADO/REJEITADO)
      ├── Lancamento (RECEITA/DESPESA)
      ├── Pendencia (ABERTA → EM_ANALISE → RESOLVIDA/CANCELADA)
      └── Relatorio (1:1 — GERADO → EM_REVISAO → VALIDADO/DEVOLVIDO → FINALIZADO)

Usuario (login) — ADMIN | CONTADOR | CLIENTE (CLIENTE vinculado a um Cliente)
```

Validação de documentos é determinística (`ValidacaoService`): confere data, valor,
vínculo cliente/competência e duplicidade por identificador. Sem IA.

## Quem pode fazer o quê

| Ação | ADMIN | CONTADOR | CLIENTE |
|---|---|---|---|
| Ver/gerenciar clientes | ✅ | ✅ | só o próprio (`/clientes/me`) |
| Criar competência | ✅ | ✅ | ❌ |
| Ver competências/documentos/lançamentos/pendências/relatórios | ✅ (todos) | ✅ (todos) | ✅ (só os seus) |
| Enviar documentos | ✅ | ✅ | ✅ (só para si) |
| Validar/rejeitar documento, resolver pendência, validar/devolver relatório | ✅ | ✅ | ❌ |
| Gerenciar usuários (`/usuarios`) | ✅ | ❌ | ❌ |

## Endpoints principais

```
POST                  /api/v1/auth/login
GET/POST/DELETE       /api/v1/usuarios                (ADMIN)
GET/POST/PUT/DELETE   /api/v1/clientes                (GET /clientes/me para o papel CLIENTE)
GET/POST              /api/v1/competencias            (?clienteId= opcional)
GET                   /api/v1/competencias/{id}        (detalhe completo)
GET                   /api/v1/competencias/minha-atual (papel CLIENTE)
PUT                   /api/v1/competencias/{id}/status
GET/PUT               /api/v1/documentos               (?competenciaId= opcional)
POST                  /api/v1/documentos/upload?clienteId=&competenciaId=
GET                   /api/v1/documentos/{id}/arquivo   (download)
GET/POST/PUT/DELETE   /api/v1/lancamentos              (?competenciaId= opcional)
GET/POST/PUT          /api/v1/pendencias               (?competenciaId=/?status= opcionais)
GET/POST              /api/v1/relatorios
POST                  /api/v1/relatorios/competencias/{competenciaId}
POST                  /api/v1/relatorios/{id}/validar
POST                  /api/v1/relatorios/{id}/devolver
GET                   /api/v1/dashboard                 (ADMIN/CONTADOR)
```

## Notas de manutenção / limitações conhecidas

- Extração de dados é *best-effort*: cobre XML de NF-e e PDF com camada de texto. Imagens
  escaneadas continuam sem extração automática (ficam `PENDENTE` para preenchimento manual).
- Storage local em disco — adequado para o MVP; trocar por object storage real é uma
  migração isolada em `FileStorageService`, sem afetar quem o consome.
- Segredo JWT tem um valor padrão de desenvolvimento no `application.properties` —
  **defina `APP_JWT_SECRET` em produção**.
- Testes cobrem as regras de negócio centrais (validação de documento, duplicidade de
  competência, ciclo de vida de pendência, JWT, escopo por cliente), não a cobertura
  completa dos controllers.
