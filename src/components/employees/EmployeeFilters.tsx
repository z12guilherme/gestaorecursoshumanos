import { Search, Filter, Plus, Upload, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departments } from '@/data/mockData';

interface EmployeeFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onAddEmployee: () => void;
  onImport?: (file: File) => void;
  onDownloadTemplate?: () => void;
}

export function EmployeeFilters({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  statusFilter,
  onStatusChange,
  onAddEmployee,
  onImport,
  onDownloadTemplate,
}: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-between">
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou cargo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={departmentFilter} onValueChange={onDepartmentChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="vacation">Férias</SelectItem>
            <SelectItem value="leave">Afastado</SelectItem>
            <SelectItem value="terminated">Desligado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        {onDownloadTemplate && (
          <Button variant="outline" onClick={onDownloadTemplate} className="gap-2 w-full sm:w-auto">
            <FileSpreadsheet className="h-4 w-4" />
            Baixar Modelo
          </Button>
        )}
        {onImport && (
          <div className="relative">
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            />
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
          </div>
        )}
        <Button onClick={onAddEmployee} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>
    </div>
  );
}
