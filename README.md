# ContaBilIT — v1.0

> **Automação contábil especializada para profissionais, desenvolvedores e consultorias de TI (PJ & Tech).**

O **ContaBilIT** é uma plataforma que automatiza o fluxo operacional repetitivo da contabilidade para o ecossistema tech (desenvolvedores PJ, engenheiros de software, consultores DevOps/SRE e startups), combinando validação determinística de documentos e supervisão humana do contador.

---

## 🎯 Foco em Profissionais de TI

A rotina fiscal e contábil de profissionais de tecnologia possui particularidades cruciais que o ContaBilIT resolve de ponta a ponta:

* **Apuração e Monitoramento do Fator R**: Cálculo entre folha/pró-labore e receita bruta para garantir enquadramento no **Anexo III (alíquota a partir de 6%)** do Simples Nacional, evitando a tributação onerosa do Anexo V (15,5%+).
* **NFS-e de Serviços de Software e Consultoria**: Suporte nativo aos principais CNAEs de tecnologia (62.01-5/01 - Desenvolvimento de Programas, 62.02-3/00 - Consultoria em TI, 62.03-1/00 e suporte).
* **Exportação de Serviços e Invoices Internacionais**: Tratamento de remessas e contratos do exterior (Deel, Wise, Payoneer, contratos em USD/EUR) com orientação para isenções de PIS, COFINS e ISS.
* **Despesas Operacionais Tech**: Conciliação de custos típicos de empresas de tecnologia (faturas de nuvem AWS/GCP/Azure, licenças SaaS como GitHub, JetBrains, Figma e coworking).

---

## 🚀 Principais Funcionalidades da Versão 1.0

1. **Autenticação e RBAC Estrito (JWT)**:
   * **ADMIN**: Gestão completa de usuários, clientes, competências, documentos e relatórios.
   * **CONTADOR**: Gestão operacional de múltiplos clientes de TI, validação de documentos, aprovação de relatórios e abertura de pendências.
   * **CLIENTE (Dev/PJ)**: Visão isolada e restrita exclusivamente aos seus próprios dados, envio de NFS-e/invoices e acompanhamento do fechamento contábil.
2. **Extração Determinística de Documentos (Sem dependência de OCR/IA)**:
   * **XML de NF-e/NFS-e**: Leitura direta das tags oficiais da Receita (valor `vNF`, data de emissão `dhEmi`/`dEmi` e chave de acesso `Id`).
   * **PDF com Camada de Texto**: Extração automatizada via Apache PDFBox com expressões regulares para identificação de valores e datas.
   * Documentos sem dados identificáveis seguem para fila de revisão assistida pelo contador.
3. **Validação Automática e Gestão de Pendências**:
   * Checagem de integridade, valores, datas, coerência com a competência e detecção de duplicidade por identificador fiscal.
   * Disparo automático de pendências com status rastreável (`ABERTA` → `EM_ANALISE` → `RESOLVIDA`).
4. **Fechamento e Relatório Mensal com Validação Humana**:
   * Balanço consolidado de receitas PJ, despesas dedutíveis, pró-labore e saldo líquido.
   * Fluxo de validação formal pelo contador antes do encerramento da competência.
5. **Storage de Arquivos Desacoplado**:
   * Armazenamento seguro de arquivos em diretório de storage com geração de identificadores UUID e endpoint de download autenticado.
6. **Interface Moderna e Responsiva**:
   * Desenvolvida em **Angular** (Standalone Components) com paleta corporativa elegante: **Buriti Corporativo (`#6B3B31`)**, **Cinza Grafite (`#212529`)**, **Verde Sucesso (`#2EA44F`)** e **Azul Foco (`#0066CC`)**.

---

## 🏗️ Arquitetura e Stack Tecnológica

* **Frontend**: Angular 20 (Standalone Components, Signals, Router, Interceptors, Zone.js).
* **Backend Nativo**: Spring Boot 3.3+ / Java 21 LTS, Spring Security, Spring Data JPA, JJWT, Apache PDFBox, H2 / PostgreSQL.
* **Runner Cloud (AI Studio)**: Node.js 22 + Express com espelhamento determinístico de 100% dos endpoints REST do Spring Boot para execução em ambiente containerizado.
* **Containers & DevOps**: Dockerfile multi-stage e Docker Compose prontos para produção.

---

## 💻 Como Executar

### 1. Execução via Docker Compose (Recomendado para ambiente completo)
Para subir o backend Spring Boot com persistência de dados em um único comando:

```bash
docker compose up --build
```
A API estará disponível em `http://localhost:8080/api/v1`.

---

### 2. Execução do Backend Spring Boot (Maven)
Requer **Java 21** (ou 17+) e **Maven**:

```bash
cd backend
mvn clean spring-boot:run
```

#### Credenciais Padrão Pré-carregadas:
| Perfil | E-mail | Senha | Finalidade |
|---|---|---|---|
| **Administrador** | `admin@contabilit.com.br` | `admin123` | Gestão de equipe e configurações |
| **Contador** | `contador@contabilit.com.br` | `contador123` | Operação e validação contábil |
| **Cliente Dev PJ** | `cliente@empresa.com.br` | `cliente123` | Portal do desenvolvedor / PJ |

*Em produção, configure a variável de ambiente `APP_JWT_SECRET` com uma chave criptográfica forte.*

---

### 3. Execução do Frontend Angular
Requer **Node.js 22** e **npm**:

```bash
cd frontend
npm install
npm start
```
Acesse `http://localhost:4200` no seu navegador.

---

### 4. Execução Integrada no Google AI Studio
No ambiente de contêiner do AI Studio, a aplicação roda de forma unificada na porta **3000** através do comando:

```bash
npm run dev
```

---

## 📁 Estrutura do Repositório

```
├── backend/                  # Backend nativo Spring Boot (Java 21)
│   ├── pom.xml               # Dependências Maven
│   ├── Dockerfile            # Imagem de build e runtime do Spring Boot
│   └── src/main/java/com/contabot/
│       ├── config/           # Cors, DataSeeder e configurações
│       ├── controller/       # Controllers REST versionados (/api/v1)
│       ├── dto/              # Records de request e response
│       ├── exception/        # Tratamento global de erros (ApiExceptionHandler)
│       ├── model/            # Entidades JPA (Cliente, Competencia, etc.)
│       ├── repository/       # Repositórios Spring Data JPA
│       ├── security/         # Spring Security, JWT Filter e Service
│       └── service/          # Lógica de negócio, validação e extração
├── frontend/                 # Aplicação Web Angular (v20 Standalone)
│   ├── angular.json          # Configuração Angular CLI com Polyfills
│   ├── src/app/features/     # Módulos: Dashboard, Clientes, Competências, etc.
│   └── src/styles.css        # Identidade visual com paleta corporativa
├── server.js                 # Runner Node.js/Express para o preview em nuvem
├── docker-compose.yml        # Orquestração do ambiente
├── DOCUMENTACAO.md           # Documento unificado: regras de negócio de TI e APIs
└── README.md                 # Este documento
```

---

## 📖 Documentação Detalhada

Para consultar a especificação completa de regras fiscais de TI, enquadramentos, diagramas de estado e documentação de todos os endpoints REST, consulte o arquivo unificado:

👉 **[DOCUMENTACAO.md](./DOCUMENTACAO.md)**

---

## 📄 Licença

Projeto desenvolvido para automação contábil especializada em tecnologia. Todos os direitos reservados.
