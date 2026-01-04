import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export const AI_TOOLS = [
  {
    name: 'navigate',
    description: 'Navegar para uma página específica do sistema',
    parameters: {
      type: 'object',
      properties: {
        path: { 
          type: 'string', 
          description: 'O caminho da rota (ex: /employees, /recruitment, /settings, /reports)' 
        }
      },
      required: ['path']
    }
  },
  {
    name: 'toggle_theme',
    description: 'Alternar o tema do sistema entre claro e escuro',
    parameters: { type: 'object', properties: {} }
  },
  {
    name: 'logout',
    description: 'Sair do sistema / Fazer logout do usuário',
    parameters: { type: 'object', properties: {} }
  }
];

export function useAiActions() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const executeTool = async (toolName: string, args: any) => {
    console.log(`[AI Action] Executing: ${toolName}`, args);
    
    switch (toolName) {
      case 'navigate':
        if (args.path) {
          navigate(args.path);
          return `Navegando para ${args.path}...`;
        }
        return 'Erro: Caminho de navegação não fornecido.';
        
      case 'toggle_theme':
        toggleTheme();
        return 'Tema alterado com sucesso.';
        
      case 'logout':
        await signOut();
        return 'Iniciando processo de logout...';
        
      default:
        return `Erro: Ferramenta '${toolName}' não reconhecida.`;
    }
  };

  return {
    executeTool,
    availableTools: AI_TOOLS
  };
}