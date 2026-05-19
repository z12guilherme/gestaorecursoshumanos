import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QrCode, User } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  role?: string;
  department?: string;
  avatar_url?: string;
}

interface EmployeeBadgeProps {
  employee: Employee;
  companyName?: string;
}

export const EmployeeBadge: React.FC<EmployeeBadgeProps> = ({
  employee,
  companyName = "HOSPITAL DMI LTDA" // Valor padrão adaptado ao seu contexto
}) => {

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visualização do Crachá na Tela (Proporção PVC) */}
      <div className="w-[216px] h-[344px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20">

        {/* Background Pattern (Simulação de textura PVC/Marca D'água) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>

        {/* Header / Lanyard hole area */}
        <div className="h-24 bg-gradient-to-b from-blue-700 to-blue-500 flex flex-col items-center justify-start pt-3 relative shadow-inner">
          {/* Furo do cordão (simulação visual) */}
          <div className="w-14 h-3 rounded-full bg-white/20 shadow-inner mb-2 backdrop-blur-sm border border-white/10"></div>
          <h3 className="text-white font-extrabold text-sm text-center px-4 w-full tracking-wide drop-shadow-md">
            {companyName}
          </h3>

          {/* Curva decorativa na base do header */}
          <svg className="absolute bottom-0 w-full h-6 text-white" preserveAspectRatio="none" viewBox="0 0 1440 54" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 54L1440 22L1440 54L0 54Z"></path>
          </svg>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-10 relative z-10">
          <div className="p-1 bg-white rounded-full shadow-md">
            <Avatar className="h-24 w-24 border-2 border-blue-50 bg-gray-50">
              <AvatarImage src={employee.avatar_url || ''} className="object-cover" />
              <AvatarFallback className="bg-gray-100 text-gray-400">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Informações */}
        <div className="flex flex-col items-center flex-1 px-4 pt-3 text-center z-10">
          <h2 className="text-[1.3rem] font-black text-slate-800 leading-tight uppercase tracking-tight">
            {employee.name.split(' ')[0]} <br />
            {employee.name.split(' ').length > 1 && <span className="text-lg text-slate-600">{employee.name.split(' ')[employee.name.split(' ').length - 1]}</span>}
          </h2>
          <div className="w-8 h-0.5 bg-blue-500 my-2 rounded-full"></div>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-widest px-2 text-center leading-tight">
            {employee.role || 'Colaborador'}
          </p>
          <p className="text-[9px] font-medium text-slate-500 mt-1.5 uppercase bg-slate-100 px-2 py-0.5 rounded-full">
            {employee.department || 'Geral'}
          </p>
        </div>

        {/* Footer / QR Code Placeholder */}
        <div className="h-[88px] bg-slate-50 flex flex-col items-center justify-center p-2 relative border-t border-slate-100 z-10">
          {/* Faixa decorativa lateral */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

          <div className="bg-white p-1 rounded-md shadow-sm border border-slate-100 mb-1">
            <QrCode className="h-10 w-10 text-slate-800" strokeWidth={1.5} />
          </div>
          <p className="text-[8px] text-slate-400 font-mono tracking-[0.2em]">
            ID:{employee.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
};