import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { USE_MOCK } from '@/lib/mockDatabase';
import { KeyRound, Loader2 } from 'lucide-react';

export function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não conferem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter no mínimo 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
          title: "Senha atualizada",
          description: "Sua senha foi alterada com sucesso (Modo Demo)."
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso."
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao tentar alterar sua senha.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Alterar Senha</CardTitle>
        </div>
        <CardDescription>
          Atualize sua senha de acesso ao sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password">Senha Atual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual"
            />
            <p className="text-[11px] text-muted-foreground">Confirme sua senha atual para segurança.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">Nova Senha</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a nova senha novamente"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Atualizar Senha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
