export type Papel = 'ADMIN' | 'CONTADOR' | 'CLIENTE';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  nome: string;
  email: string;
  papel: Papel;
  clienteId: number | null;
}

export interface UsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  papel: Papel;
  clienteId?: number;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
  clienteId: number | null;
  ativo: boolean;
}

export type TipoCliente = 'PESSOA_FISICA' | 'PESSOA_JURIDICA';

export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string | null;
  email: string | null;
  telefone: string | null;
  tipo: TipoCliente;
  ativo: boolean;
  criadoEm: string;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj?: string;
  email?: string;
  telefone?: string;
  tipo: TipoCliente;
  ativo: boolean;
}

export type StatusCompetencia =
  | 'ABERTA' | 'EM_PROCESSAMENTO' | 'AGUARDANDO_VALIDACAO' | 'PENDENTE' | 'VALIDADA' | 'ENCERRADA';

export interface Competencia {
  id: number;
  cliente: Cliente;
  ano: number;
  mes: number;
  status: StatusCompetencia;
  criadaEm: string;
  fechadaEm: string | null;
  totalDocumentos: number;
  documentosValidados: number;
  totalPendencias: number;
  pendenciasAbertas: number;
}

export interface CompetenciaRequest {
  clienteId: number;
  ano: number;
  mes: number;
}

export interface CompetenciaDetalhe {
  competencia: Competencia;
  documentos: Documento[];
  lancamentos: Lancamento[];
  pendencias: Pendencia[];
  relatorio: Relatorio | null;
}

export type TipoDocumento = 'NOTA_FISCAL' | 'COMPROVANTE' | 'RECIBO' | 'DOCUMENTO_FISCAL' | 'OUTRO';
export type StatusDocumento = 'RECEBIDO' | 'EM_ANALISE' | 'VALIDADO' | 'PENDENTE' | 'REJEITADO';

export interface Documento {
  id: number;
  clienteId: number;
  clienteNome: string;
  competenciaId: number;
  nomeArquivo: string;
  tipo: TipoDocumento;
  status: StatusDocumento;
  dataDocumento: string | null;
  valor: number | null;
  identificador: string | null;
  enviadoEm: string;
  observacao: string | null;
}

export interface DocumentoAtualizacaoRequest {
  status: StatusDocumento;
  observacao?: string;
}

export type TipoLancamento = 'RECEITA' | 'DESPESA';

export interface Lancamento {
  id: number;
  competenciaId: number;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  vencimento: string;
  pago: boolean;
}

export interface LancamentoRequest {
  competenciaId: number;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  vencimento: string;
  pago: boolean;
}

export type TipoPendencia =
  | 'DOCUMENTO_AUSENTE' | 'DOCUMENTO_INCONSISTENTE' | 'COMPETENCIA_INCORRETA'
  | 'DADO_INVALIDO' | 'DOCUMENTO_DUPLICADO' | 'INFORMACAO_NECESSARIA' | 'OUTRO';
export type StatusPendencia = 'ABERTA' | 'EM_ANALISE' | 'RESOLVIDA' | 'CANCELADA';

export interface Pendencia {
  id: number;
  competenciaId: number;
  documentoId: number | null;
  tipo: TipoPendencia;
  descricao: string;
  status: StatusPendencia;
  criadaEm: string;
  resolvidaEm: string | null;
}

export interface PendenciaRequest {
  competenciaId: number;
  documentoId?: number;
  tipo: TipoPendencia;
  descricao: string;
}

export type StatusRelatorio = 'GERADO' | 'EM_REVISAO' | 'VALIDADO' | 'DEVOLVIDO' | 'FINALIZADO';

export interface Relatorio {
  id: number;
  competenciaId: number;
  geradoEm: string;
  status: StatusRelatorio;
  observacoes: string | null;
  receitas: number;
  despesas: number;
  saldo: number;
  totalDocumentos: number;
  documentosValidados: number;
  totalPendencias: number;
  pendenciasAbertas: number;
}

export interface DashboardResumo {
  clientes: number;
  competenciasAbertas: number;
  competenciasAguardandoValidacao: number;
  competenciasValidadas: number;
  competenciasComPendencias: number;
  totalDocumentos: number;
  pendenciasAbertas: number;
  receitas: number;
  despesas: number;
  saldo: number;
}
