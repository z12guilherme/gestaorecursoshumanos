import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { QrCode, Download, User } from 'lucide-react';
import jsPDF from 'jspdf';

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

  const handleDownloadPDF = async () => {
    // Criar o documento no tamanho de um cartão PVC padrão (54mm x 86mm)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [54, 86]
    });

    // Fundo do crachá
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 54, 86, 'F');

    // Faixa superior (Azul)
    doc.setFillColor(41, 128, 185); 
    doc.rect(0, 0, 54, 15, 'F');

    // Nome da Empresa
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(companyName, 27, 10, { align: "center" });

    // Placeholder do Avatar (Círculo cinza)
    // Nota: Para inserir a imagem real com jsPDF, ela precisa estar em base64. 
    // O placeholder circular serve como marcação para impressão.
    doc.setFillColor(230, 230, 230);
    doc.circle(27, 35, 14, 'F');
    
    // Pega o primeiro e último nome
    const nameParts = employee.name.split(' ');
    const shortName = nameParts.length > 1 
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1]}` 
      : employee.name;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(shortName.toUpperCase(), 27, 56, { align: "center" });

    // Cargo e Departamento
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text((employee.role || 'COLABORADOR').toUpperCase(), 27, 62, { align: "center" });
    
    doc.setFontSize(7);
    doc.text((employee.department || 'GERAL').toUpperCase(), 27, 66, { align: "center" });

    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(10, 70, 44, 70);

    // ID / Matrícula (Simulação do local do QR Code/Barras)
    doc.setFontSize(6);
    doc.setTextColor(150, 150, 150);
    doc.text(`MATRÍCULA: ${employee.id.substring(0, 8).toUpperCase()}`, 27, 80, { align: "center" });

    // Baixar o PDF
    doc.save(`Cracha_${employee.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visualização do Crachá na Tela (Proporção PVC) */}
      <div className="w-[216px] h-[344px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col relative transition-transform hover:scale-105">
        
        {/* Header / Lanyard hole area */}
        <div className="h-16 bg-blue-600 flex flex-col items-center justify-center pt-2 relative">
          {/* Furo do cordão (simulação visual) */}
          <div className="w-12 h-2 rounded-full bg-white/30 absolute top-2"></div>
          <h3 className="text-white font-bold text-sm text-center px-2 truncate w-full mt-2">
            {companyName}
          </h3>
        </div>

        {/* Avatar */}
        <div className="flex justify-center -mt-8 relative z-10">
          <Avatar className="h-24 w-24 border-4 border-white shadow-sm bg-white">
            <AvatarImage src={employee.avatar_url || ''} className="object-cover" />
            <AvatarFallback className="bg-gray-100 text-gray-500">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Informações */}
        <div className="flex flex-col items-center flex-1 px-4 pt-4 text-center">
          <h2 className="text-xl font-bold text-gray-800 leading-tight">
            {employee.name.split(' ')[0]} <br/>
            {employee.name.split(' ').length > 1 && employee.name.split(' ')[employee.name.split(' ').length - 1]}
          </h2>
          <p className="text-xs font-semibold text-blue-600 mt-2 uppercase tracking-wider">
            {employee.role || 'Colaborador'}
          </p>
          <p className="text-[10px] text-gray-500 mt-1 uppercase">
            {employee.department || 'Geral'}
          </p>
        </div>

        {/* Footer / QR Code Placeholder */}
        <div className="h-20 bg-gray-50 border-t flex flex-col items-center justify-center p-2">
          <QrCode className="h-10 w-10 text-gray-800 mb-1" />
          <p className="text-[8px] text-gray-400 font-mono tracking-widest">
            ID: {employee.id.substring(0, 8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Botão de Exportação */}
      <Button onClick={handleDownloadPDF} variant="outline" className="w-full max-w-[216px] gap-2">
        <Download className="h-4 w-4" />
        Baixar Crachá (PDF)
      </Button>
    </div>
  );
};