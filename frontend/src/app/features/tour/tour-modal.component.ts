import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TourSlide {
  badge: string;
  titulo: string;
  subtitulo: string;
  conteudo: string;
  detalhes: string[];
  destaque: {
    rotulo: string;
    valor: string;
    descricao: string;
  };
}

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tour-backdrop" (click)="fechar.emit()">
      <div class="tour-container" (click)="$event.stopPropagation()">
        <!-- Header da Apresentação -->
        <div class="tour-header">
          <div class="tour-badge">
            <span class="icon">✨</span>
            <span>Apresentação Guiada do Sistema</span>
          </div>
          <button class="btn-close" (click)="fechar.emit()" title="Fechar tour">✕</button>
        </div>

        <!-- Conteúdo do Slide Ativo -->
        <div class="tour-body">
          <div class="slide-indicator">
            <span
              *ngFor="let s of slides; let i = index"
              class="dot"
              [class.active]="i === indice"
              (click)="indice = i"
            ></span>
          </div>

          <div class="slide-content">
            <div class="slide-top">
              <span class="step-tag">Passo {{ indice + 1 }} de {{ slides.length }} · {{ slideAtual.badge }}</span>
              <h2>{{ slideAtual.titulo }}</h2>
              <p class="subtitle">{{ slideAtual.subtitulo }}</p>
            </div>

            <div class="slide-grid">
              <div class="slide-text">
                <p class="desc">{{ slideAtual.conteudo }}</p>
                <ul class="features-list">
                  <li *ngFor="let d of slideAtual.detalhes">
                    <span class="check">✓</span>
                    <span>{{ d }}</span>
                  </li>
                </ul>
              </div>

              <div class="slide-highlight">
                <span class="h-badge">Destaque Tech</span>
                <strong class="h-value">{{ slideAtual.destaque.valor }}</strong>
                <span class="h-label">{{ slideAtual.destaque.rotulo }}</span>
                <p class="h-desc">{{ slideAtual.destaque.descricao }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer com Controles e Acesso Rápido -->
        <div class="tour-footer">
          <div class="quick-try">
            <span class="quick-label">Experimentar agora:</span>
            <button class="btn-role" (click)="entrarPerfil.emit('CLIENTE')">
              💻 Entrar como Dev PJ
            </button>
            <button class="btn-role" (click)="entrarPerfil.emit('CONTADOR')">
              📊 Entrar como Contador
            </button>
          </div>

          <div class="nav-controls">
            <button class="btn-nav" [disabled]="indice === 0" (click)="anterior()">
              ← Anterior
            </button>
            <button
              class="btn-nav primary"
              *ngIf="indice < slides.length - 1"
              (click)="proximo()"
            >
              Próximo →
            </button>
            <button
              class="btn-nav primary success"
              *ngIf="indice === slides.length - 1"
              (click)="fechar.emit()"
            >
              Concluir Tour ✓
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tour-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(43, 24, 18, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .tour-container {
      background: rgba(255, 253, 250, 0.98);
      border: 1px solid rgba(234, 223, 215, 0.95);
      border-radius: 20px;
      box-shadow: 0 24px 60px rgba(92, 48, 25, 0.22);
      width: 100%;
      max-width: 720px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(16px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Header */
    .tour-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid rgba(234, 223, 215, 0.8);
      background: rgba(255, 248, 241, 0.6);
    }

    .tour-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
      color: #81391f;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 18px;
      color: #81746b;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: grid;
      place-items: center;
      transition: all 0.15s ease;
    }

    .btn-close:hover {
      background: #f0dfd5;
      color: #342820;
    }

    /* Body */
    .tour-body {
      padding: 26px 32px 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .slide-indicator {
      display: flex;
      gap: 8px;
      justify-content: center;
      margin-bottom: 8px;
    }

    .dot {
      width: 30px;
      height: 4px;
      border-radius: 4px;
      background: #eadfd7;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .dot.active {
      background: #c65d2e;
      width: 48px;
    }

    .slide-top {
      margin-bottom: 16px;
    }

    .step-tag {
      font-size: 11px;
      font-weight: 700;
      color: #c65d2e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .slide-top h2 {
      font-size: 24px;
      color: #342820;
      margin: 6px 0;
      letter-spacing: -0.4px;
    }

    .subtitle {
      font-size: 13px;
      color: #81746b;
      margin: 0;
      line-height: 1.4;
    }

    .slide-grid {
      display: grid;
      grid-template-columns: 1.3fr 1fr;
      gap: 20px;
      align-items: start;
    }

    .desc {
      font-size: 13px;
      color: #49372d;
      line-height: 1.6;
      margin: 0 0 14px;
    }

    .features-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .features-list li {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: #49372d;
      line-height: 1.4;
    }

    .check {
      color: #267346;
      font-weight: 800;
      flex-shrink: 0;
    }

    .slide-highlight {
      background: linear-gradient(145deg, #fff4e9, #ffe8d6);
      border: 1px solid #f0c6ad;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 14px rgba(92, 48, 25, 0.05);
    }

    .h-badge {
      font-size: 10px;
      font-weight: 700;
      color: #a94320;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .h-value {
      font-size: 26px;
      font-weight: 800;
      color: #81391f;
      margin: 6px 0 2px;
      letter-spacing: -0.5px;
    }

    .h-label {
      font-size: 12px;
      font-weight: 700;
      color: #593725;
      margin-bottom: 6px;
    }

    .h-desc {
      font-size: 11px;
      color: #81746b;
      margin: 0;
      line-height: 1.4;
    }

    /* Footer */
    .tour-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 26px;
      border-top: 1px solid rgba(234, 223, 215, 0.9);
      background: rgba(255, 249, 243, 0.7);
      flex-wrap: wrap;
      gap: 12px;
    }

    .quick-try {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .quick-label {
      font-size: 11px;
      color: #81746b;
      font-weight: 600;
    }

    .btn-role {
      background: #ffffff;
      border: 1px solid #f0c6ad;
      color: #74432e;
      border-radius: 8px;
      padding: 6px 10px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-role:hover {
      background: #fff0e6;
      border-color: #d98b62;
      color: #593725;
      transform: translateY(-1px);
    }

    .nav-controls {
      display: flex;
      gap: 8px;
    }

    .btn-nav {
      background: #ffffff;
      border: 1px solid #e3d4c9;
      color: #49372d;
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .btn-nav:hover:not(:disabled) {
      background: #fdf5ef;
      border-color: #d98b62;
    }

    .btn-nav:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .btn-nav.primary {
      background: #c65d2e;
      border-color: #c65d2e;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(198, 93, 46, 0.25);
    }

    .btn-nav.primary:hover {
      background: #a94320;
    }

    .btn-nav.success {
      background: #267346;
      border-color: #267346;
      box-shadow: 0 2px 8px rgba(38, 115, 70, 0.25);
    }

    .btn-nav.success:hover {
      background: #1f5d38;
    }

    @media (max-width: 600px) {
      .slide-grid {
        grid-template-columns: 1fr;
      }
      .tour-footer {
        flex-direction: column;
        align-items: stretch;
      }
      .quick-try, .nav-controls {
        justify-content: space-between;
      }
    }
  `],
})
export class TourModalComponent {
  @Output() fechar = new EventEmitter<void>();
  @Output() entrarPerfil = new EventEmitter<'CLIENTE' | 'CONTADOR' | 'ADMIN'>();

  indice = 0;

  slides: TourSlide[] = [
    {
      badge: 'Visão Geral',
      titulo: 'Contabilidade Especializada em TI',
      subtitulo: 'Solução sob medida para Devs PJ, Squads e Consultorias de Software.',
      conteudo: 'O ContaBilIT simplifica a burocracia contábil do setor tech, integrando emissão de notas de software, apuração tributária de Simples Nacional e supervisão humana do contador.',
      detalhes: [
        'Atendimento especializado para CNAEs 62.01, 62.02 e 62.03',
        'Portal do desenvolvedor separado do painel do escritório',
        'Controle completo de competências mensais e obrigações',
      ],
      destaque: {
        rotulo: 'Tributação Inicial de TI',
        valor: '6,0%',
        descricao: 'Alíquota reduzida no Anexo III através da apuração do Fator R.',
      },
    },
    {
      badge: 'Economia Fiscal',
      titulo: 'Cálculo e Monitoramento do Fator R',
      subtitulo: 'Evite pagar 15,5% no Anexo V sem surpresas no fim do mês.',
      conteudo: 'O sistema audita mensalmente a relação entre o Pró-labore dos sócios e o faturamento PJ. Se o Fator R atingir 28%, a empresa é tributada no Anexo III, economizando mais de 50% em impostos.',
      detalhes: [
        'Alerta de pró-labore mínimo para cumprimento da meta de 28%',
        'Simulação preventiva antes do cálculo e fechamento do DAS',
        'Acompanhamento do histórico de receitas brutas nos últimos 12 meses',
      ],
      destaque: {
        rotulo: 'Meta do Fator R',
        valor: '≥ 28%',
        descricao: 'Garante o enquadramento no Anexo III do Simples Nacional.',
      },
    },
    {
      badge: 'Contratos & Invoices',
      titulo: 'Trabalho Remoto & Exterior (Deel, Wise)',
      subtitulo: 'Isenção de PIS, COFINS e ISS em exportação de software.',
      conteudo: 'Para desenvolvedores que prestam serviços a clientes no exterior (EUA/Europa), o ContaBilIT gerencia invoices em moeda estrangeira e exige o comprovante de fechamento de câmbio para blindagem fiscal.',
      detalhes: [
        'Comprovação de não-incidência tributária na exportação',
        'Cruzamento automático entre Invoice e liquidação cambial em BRL',
        'Lançamento de despesas de servidores cloud (AWS, GCP, Azure)',
      ],
      destaque: {
        rotulo: 'Impostos Federais Isentos',
        valor: '0% PIS/ISS',
        descricao: 'Isenção comprovada para serviços de TI com resultado no exterior.',
      },
    },
    {
      badge: 'Validação Confiável',
      titulo: 'Extração Determinística sem Falhas',
      subtitulo: 'Leitura direta de XML de NF-e e PDFs oficiais sem alucinações de IA.',
      conteudo: 'O motor do ContaBilIT lê diretamente a árvore XML oficial da Receita (tags vNF, dhEmi, chave de acesso) e texto de PDFs. Dados ausentes viram pendências rastreáveis em vez de números fictícios.',
      detalhes: [
        'Detecção automática de documentos duplicados por chave',
        'Identificação de dados pendentes com atribuição de responsável',
        'Armazenamento isolado de arquivos em storage com download seguro',
      ],
      destaque: {
        rotulo: 'Precisão de Extração',
        valor: '100%',
        descricao: 'Validação determinística baseada na estrutura oficial do documento.',
      },
    },
    {
      badge: 'Supervisão Humana',
      titulo: 'Fechamento Validado por Contador',
      subtitulo: 'A tranquilidade de ter um profissional homologando cada competência.',
      conteudo: 'Nenhuma competência é encerrada de forma cega. O contador revisa o relatório gerado, valida receitas e despesas e assina o fechamento antes do envio definitivo das guias de arrecadação.',
      detalhes: [
        'Relatório gerencial com receitas, despesas e saldo líquido',
        'Fluxo de devolução com apontamento de pendências específicas',
        'Trilhas de auditoria e conformidade fiscal completa',
      ],
      destaque: {
        rotulo: 'Garantia Contábil',
        valor: 'Humana',
        descricao: 'Supervisão técnica de contador habilitado em cada fechamento.',
      },
    },
  ];

  get slideAtual(): TourSlide {
    return this.slides[this.indice];
  }

  proximo(): void {
    if (this.indice < this.slides.length - 1) {
      this.indice++;
    }
  }

  anterior(): void {
    if (this.indice > 0) {
      this.indice--;
    }
  }
}
