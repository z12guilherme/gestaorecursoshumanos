import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Bell, Palette, Upload, Loader2, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do formulário
  const [formData, setFormData] = useState({
    id: '',
    developer_name: '',
    avatar_url: '',
    company_name: '',
    cnpj: '',
    email: '',
    notifications_enabled: true,
    theme: 'light'
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setFormData({
            id: data.id,
            developer_name: data.developer_name || '',
            avatar_url: data.avatar_url || '',
            company_name: data.company_name || '',
            cnpj: data.cnpj || '',
            email: data.email || '',
            notifications_enabled: data.notifications_enabled ?? true,
            theme: data.theme || 'light'
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `avatar-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setSaving(true);
      
      // 1. Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualizar estado local
      // Adiciona timestamp para evitar cache do navegador
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setFormData(prev => ({ ...prev, avatar_url: publicUrlWithTimestamp }));

      toast({ title: "Imagem carregada", description: "Clique em Salvar para confirmar a alteração." });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Erro no upload", description: "Verifique se o bucket 'avatars' é público no Supabase.", variant: "destructive" });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o input para permitir re-upload do mesmo arquivo
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const payload = {
        developer_name: formData.developer_name,
        avatar_url: formData.avatar_url,
        company_name: formData.company_name,
        cnpj: formData.cnpj,
        email: formData.email,
        notifications_enabled: formData.notifications_enabled,
        updated_at: new Date().toISOString()
      };
      
      let error;
      if (formData.id) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', formData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('settings')
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As alterações foram aplicadas com sucesso.",
      });
      
      // Recarrega a página para atualizar o Sidebar
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'company', label: 'Empresa', icon: Building2 },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  return (
    <AppLayout title="Configurações" subtitle="Gerencie as preferências do sistema e sua conta">
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl">
        {/* Sidebar Menu */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  "justify-start gap-3",
                  activeTab === item.id && "bg-secondary font-medium"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Perfil do Administrador</CardTitle>
                <CardDescription>Informações exibidas na barra lateral e relatórios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row gap-6">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <Avatar className="h-24 w-24 border-2 border-border">
                      <AvatarImage 
                        key={formData.avatar_url} // Força re-render quando a URL muda
                        src={formData.avatar_url || "/placeholder.svg"} 
                        className="object-cover" 
                      />
                      <AvatarFallback className="text-2xl">AD</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-medium">Foto de Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique na imagem para alterar. Recomendado: 400x400px.
                    </p>
                  </div>
                </div>
                
                <Separator />

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="devName">Nome de Exibição</Label>
                    <Input
                      id="devName"
                      value={formData.developer_name}
                      onChange={(e) => setFormData({...formData, developer_name: e.target.value})}
                      placeholder="Ex: [DEV] Marcos Guilherme"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail de Contato</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="admin@empresa.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da Empresa</CardTitle>
                <CardDescription>Informações utilizadas em cabeçalhos de relatórios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Razão Social / Nome Fantasia</Label>
                  <Input
                    id="companyName"
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    placeholder="Minha Empresa S.A."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>Gerencie como você recebe alertas do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label className="text-base">Alertas por E-mail</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber resumos semanais e alertas de prazos.
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifications_enabled}
                    onCheckedChange={(c) => setFormData({...formData, notifications_enabled: c})}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Personalize a interface do sistema.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2 cursor-not-allowed opacity-50">
                    <div className="h-24 rounded-md bg-slate-100 border-2 border-slate-200" />
                    <span className="block text-center text-sm font-medium">Claro (Padrão)</span>
                  </div>
                  <div className="space-y-2 cursor-not-allowed opacity-50">
                    <div className="h-24 rounded-md bg-slate-950 border-2 border-slate-800" />
                    <span className="block text-center text-sm font-medium">Escuro</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  * O tema é controlado atualmente pelo botão na barra lateral. Esta configuração será sincronizada em breve.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || loading} className="min-w-[120px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}