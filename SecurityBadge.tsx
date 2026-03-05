import { ShieldCheck, Lock } from 'lucide-react';

export function SecurityBadge() {
  return (
    <div className="group relative flex justify-center z-50">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 rounded-full text-xs font-medium cursor-help transition-all hover:bg-emerald-100 hover:shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Segurança Verificada</span>
      </div>
      
      {/* Tooltip Customizado */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-white rounded-lg shadow-xl border border-slate-100 text-left animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-2 mb-1 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
          <Lock className="w-3 h-3" />
          Auditoria Concluída
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Este sistema passou por testes rigorosos de segurança (Pentest) e proteção de dados em <strong>05/03/2026</strong>.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-medium">SSL/TLS</span>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-medium">Dados Criptografados</span>
          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-medium">Monitoramento 24/7</span>
        </div>
        {/* Seta do Tooltip */}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
      </div>
    </div>
  );
}