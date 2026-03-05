import { ShieldCheck, Lock } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="group relative flex justify-center z-50">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 rounded-full text-xs font-medium cursor-help transition-all hover:bg-emerald-100 hover:shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Segurança Verificada</span>
      </div>
      
      {/* Tooltip Técnico Customizado */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-72 p-4 bg-white rounded-lg shadow-xl border border-slate-100 text-left animate-in fade-in zoom-in-95 duration-200 z-50">
        <div className="flex items-center gap-2 mb-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          Auditoria de Segurança
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-3">
          Este sistema foi submetido a testes de intrusão (Pentest) e validação de segurança em <strong>05/03/2026</strong>.
        </p>
        
        <div className="space-y-2 border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Vulnerabilidades Críticas</span>
                <span className="font-mono font-bold text-emerald-600">0 Detectadas</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Proteção de Dados</span>
                <span className="font-mono font-bold text-emerald-600">RLS (Row Level Security)</span>
            </div>
             <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>Criptografia</span>
                <span className="font-mono font-bold text-emerald-600">TLS 1.3 / AES-256</span>
            </div>
        </div>

        {/* Seta do Tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
      </div>
    </div>
  );
}