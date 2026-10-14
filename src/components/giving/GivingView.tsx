import React, { useState } from 'react';
import { useChurch } from '../../context/ChurchContext';
import { Contribution } from '../../types';
import { QrCodeSvg } from '../common/QrCodeSvg';
import { canAccessFinancialReports } from '../../services/permissionSecurityService';
import {
  HeartHandshake,
  QrCode,
  CreditCard,
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
  ArrowRight,
  Receipt,
  Lock,
  BarChart3
} from 'lucide-react';

export const GivingView: React.FC = () => {
  const {
    churchSettings,
    currentUser,
    contributions,
    addContribution
  } = useChurch();

  const [category, setCategory] = useState<Contribution['category']>('dizimo');
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<Contribution['method']>('pix');
  const [copiedPix, setCopiedPix] = useState(false);
  const [recentReceipt, setRecentReceipt] = useState<Contribution | null>(null);

  const amountToContribute = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const pixCopyPastePayload = `00020126580014BR.GOV.BCB.PIX0114${churchSettings.pixKey}520400005303986540${amountToContribute.toFixed(2)}5802BR5925${churchSettings.pixBeneficiary.substring(0, 25)}6006CUIABA62070503***6304${Math.floor(1000 + Math.random() * 9000)}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixCopyPastePayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleConfirmContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountToContribute <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    const receipt = addContribution(amountToContribute, category, method);
    setRecentReceipt(receipt);
  };

  const categoryNames: Record<Contribution['category'], string> = {
    dizimo: 'Dízimo do Mês',
    oferta: 'Oferta de Gratidão Geral',
    missoes: 'Missões & Evangelismo',
    obra_social: 'Ação Social da Igreja',
    construcao: 'Manutenção & Melhorias do Templo'
  };

  // Cada membro vê estritamente o seu próprio histórico pessoal
  const myContributions = contributions.filter((c) => c.userId === currentUser.id);
  const totalGivenYear = myContributions.reduce((acc, curr) => acc + curr.amount, 0);

  // Relatório financeiro global: Exclusivo de Admin Geral e Líder Pastoral
  const canViewGlobalFinances = canAccessFinancialReports(currentUser);
  const totalGlobalContributions = contributions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-20 md:pb-12 animate-fade-in">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase font-bold tracking-widest text-amber-400">
            Generosidade & Mordomia Cristã
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Dízimos, Ofertas & Missões — {churchSettings.acronym}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed max-w-2xl">
          "Trazei todos os dízimos à casa do tesouro, para que haja mantimento na minha casa, e depois fazei prova de mim, diz o Senhor dos Exércitos." (Malaquias 3:10)
        </p>
      </div>

      {/* Main Contribution Form & Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <form onSubmit={handleConfirmContribution} className="space-y-6">
            {/* Step 1: Destination */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                1. Destinação da Contribuição:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(Object.keys(categoryNames) as Contribution['category'][]).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      category === cat
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {categoryNames[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Amount selection */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                2. Valor da Contribuição:
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[50, 100, 200, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedAmount === amt && !customAmount
                        ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    R$ {amt}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  R$ Outro Valor:
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Digite o valor..."
                  className="w-full pl-32 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                3. Forma de Pagamento:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('pix')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'pix'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>PIX Instantâneo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('cartao')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'cartao'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Cartão</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('boleto')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    method === 'boleto'
                      ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Boleto Bancário</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Chave PIX Oficial:</span>
                <span className="font-mono font-bold text-amber-400">{churchSettings.pixKey}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Favorecido:</span>
                <span className="text-white font-medium">{churchSettings.pixBeneficiary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Instituição:</span>
                <span className="text-white font-medium">{churchSettings.pixBank}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Confirmar Registro de Contribuição de R$ {amountToContribute.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* QR Code Panel */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
              QR Code PIX IGEAD-MT
            </span>
            <p className="text-xs text-slate-400 mb-4">
              Escaneie com o app do seu banco para transferir R$ {amountToContribute.toFixed(2)}
            </p>

            <QrCodeSvg
              value={pixCopyPastePayload}
              size={180}
              label={`R$ ${amountToContribute.toFixed(2)}`}
            />

            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Ambiente Oficial & Seguro — IGEAD-MT</span>
            </div>
          </div>

          {/* Recent Receipt */}
          {recentReceipt && (
            <div className="p-5 rounded-3xl bg-amber-400/10 border border-amber-400/30 text-slate-200 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                  <Receipt className="w-3.5 h-3.5" />
                  Comprovante Oficial Emitido
                </span>
                <span className="text-[10px] text-slate-400">
                  {recentReceipt.date}
                </span>
              </div>
              <p className="text-xs font-bold text-white">
                {categoryNames[recentReceipt.category]}: R$ {recentReceipt.amount.toFixed(2)}
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                Código: {recentReceipt.codeReceipt}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Relatório Financeiro Global (Exclusivo Administrador Geral e Pastoral) */}
      {canViewGlobalFinances ? (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Relatório Financeiro Global — Acesso Restrito à Gestão Geral
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Autorizado: {currentUser.role === 'admin' ? 'Administrador Geral' : 'Líder Pastoral'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Total de Entradas Registradas:</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                R$ {totalGlobalContributions.toFixed(2)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Total de Contribuintes:</span>
              <span className="text-lg font-bold text-white font-mono">
                {new Set(contributions.map((c) => c.userId)).size} membros
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Status de Conformidade:</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-4 h-4" /> Prestação em Dia
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-500 flex items-center gap-2">
          <Lock className="w-4 h-4 text-slate-600 shrink-0" />
          <span>
            Relatórios financeiros consolidados globais são de competência restrita da Administração Geral e Liderança Pastoral.
          </span>
        </div>
      )}

      {/* Histórico Pessoal de Contribuições */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Meu Histórico Pessoal de Contribuições
            </h3>
            <p className="text-xs text-slate-400">
              Extrato para acompanhamento e emissão do informe de doações
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">
              Total Pessoal no Ano: <strong className="text-amber-400 font-mono">R$ {totalGivenYear.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Data</th>
                <th className="pb-3 font-semibold">Destinação</th>
                <th className="pb-3 font-semibold">Método</th>
                <th className="pb-3 font-semibold">Valor</th>
                <th className="pb-3 font-semibold">Código</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {myContributions.map((c) => (
                <tr key={c.id} className="text-slate-300">
                  <td className="py-3 font-mono">{c.date}</td>
                  <td className="py-3 font-medium text-white">{categoryNames[c.category]}</td>
                  <td className="py-3 uppercase text-[11px] text-slate-400">{c.method}</td>
                  <td className="py-3 font-bold text-amber-400 font-mono">
                    R$ {c.amount.toFixed(2)}
                  </td>
                  <td className="py-3 font-mono text-[11px] text-slate-400">
                    {c.codeReceipt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
