import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Bell, Palette, Upload, Loader2, Camera, Shield, ListPlus, Globe, Trash2, Plus, Linkedin, Instagram, Users, UserPlus, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { MfaSetup } from '@/components/settings/MfaSetup';
import { ChangePassword } from '@/components/settings/ChangePassword';
import { ActiveSessionsManager } from '@/components/ActiveSessionsManager';
import { mockDatabase, USE_MOCK } from '@/lib/mockDatabase';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const companyLogoRef = useRef<HTMLInputElement>(null);
  const { refreshProfile } = useAuth();

  // Estado para gerenciamento de usuários
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  // Estado para o perfil do usuário
  const [profileData, setProfileData] = useState({
    id: '',
    full_name: '',
    avatar_url: '',
    email: '',
    display_role: '',
  });

  // Estado para as configurações da empresa
  const [companySettings, setCompanySettings] = useState({
    id: '',
    company_name: '',
    cnpj: '',
    email: '',
    notifications_enabled: true,
    avatar_url: '',
    login_background_url: '',
    login_title: '',
    login_subtitle: '',
    employee_custom_fields_config: [] as any[],
    career_page_banner: '',
    career_page_description: '',
    social_links: { linkedin: '', instagram: '', website: '' },
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // 🔀 Desvio Offline (Mock)
        if (USE_MOCK) {
          setProfileData({
            id: 'mock-admin-1',
            full_name: 'Administrador Demo',
            avatar_url: '',
            email: 'admin@demo.com',
            display_role: 'Gerente de RH'
          });

          const settings = mockDatabase.get('settings');
          if (settings) {
            setCompanySettings({
              id: settings.id || 'mock-settings-1',
              company_name: settings.company_name || '',
              cnpj: settings.cnpj || '',
              email: settings.email || '',
              notifications_enabled: settings.notifications_enabled ?? true,
              avatar_url: settings.avatar_url || '',
              login_background_url: settings.login_background_url || '',
              login_title: settings.login_title || '',
              login_subtitle: settings.login_subtitle || '',
              employee_custom_fields_config: settings.employee_custom_fields_config || [],
              career_page_banner: settings.career_page_banner || '',
              career_page_description: settings.career_page_description || '',
              social_links: { linkedin: '', instagram: '', website: '', ...(settings.social_links || {}) },
            });
          }
          setLoading(false);
          return;
        }

        // 1. Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw userError || new Error('User not found.');

        // 2. Fetch user profile from 'profiles' table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, display_role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        setProfileData({
          id: user.id,
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          email: user.email || '',
          display_role: profile.display_role || ''
        });

        // 3. Fetch company settings from 'settings' table
        const { data: settings, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .maybeSingle();

        if (settingsError) throw settingsError;
        if (settings) {
          setCompanySettings({
            id: settings.id,
            company_name: settings.company_name || '',
            cnpj: settings.cnpj || '',
            email: settings.email || '',
            notifications_enabled: settings.notifications_enabled ?? true,
            avatar_url: settings.avatar_url || '',
            login_background_url: settings.login_background_url || '',
            login_title: settings.login_title || '',
            login_subtitle: settings.login_subtitle || '',
            employee_custom_fields_config: settings.employee_custom_fields_config || [],
            career_page_banner: settings.career_page_banner || '',
            career_page_description: settings.career_page_description || '',
            social_links: { linkedin: '', instagram: '', website: '', ...(settings.social_links || {}) },
          });
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar as configurações.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${profileData.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setSaving(true);

      if (USE_MOCK) {
        const fakeUrl = URL.createObjectURL(file);
        setProfileData(prev => ({ ...prev, avatar_url: fakeUrl }));
        toast({ title: "Imagem carregada", description: "Modo Demo: Imagem aplicada localmente." });
        return;
      }

      // 1. Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600', // 1 hour cache
          upsert: true // Overwrite existing file with same name
        });

      if (uploadError) throw uploadError;

      // 2. Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Atualizar estado local
      // Adiciona timestamp para evitar cache do navegador
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setProfileData(prev => ({ ...prev, avatar_url: publicUrlWithTimestamp }));

      toast({ title: "Imagem carregada", description: "Clique em Salvar para confirmar a alteração." });

    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({ title: "Erro no upload", description: "Verifique se o bucket 'avatars' é público no Supabase.", variant: "destructive" });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Limpa o input para permitir re-upload do mesmo arquivo
    }
  };

  const handleCompanyLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `company/${Date.now()}.${fileExt}`;

    try {
      setSaving(true);

      if (USE_MOCK) {
        const fakeUrl = URL.createObjectURL(file);
        setCompanySettings(prev => ({ ...prev, avatar_url: fakeUrl }));
        toast({ title: "Logo carregada", description: "Modo Demo: Logo aplicada localmente." });
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setCompanySettings(prev => ({ ...prev, avatar_url: publicUrlWithTimestamp }));

      toast({ title: "Logo carregada", description: "Clique em Salvar para confirmar a alteração." });
    } catch (error: any) {
      console.error('Error uploading company logo:', error);
      toast({ title: "Erro no upload", description: "Verifique as permissões de storage.", variant: "destructive" });
    } finally {
      setSaving(false);
      if (companyLogoRef.current) companyLogoRef.current.value = '';
    }
  };

  const handleCompanyBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `backgrounds/${Date.now()}.${fileExt}`;

    try {
      setSaving(true);

      if (USE_MOCK) {
        const fakeUrl = URL.createObjectURL(file);
        setCompanySettings(prev => ({ ...prev, login_background_url: fakeUrl }));
        toast({ title: "Fundo carregado", description: "Modo Demo: Imagem aplicada localmente." });
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setCompanySettings(prev => ({ ...prev, login_background_url: publicUrlWithTimestamp }));

      toast({ title: "Fundo de login carregado", description: "Clique em Salvar para confirmar." });
    } catch (error: any) {
      console.error('Error uploading background:', error);
      toast({ title: "Erro no upload", description: "Verifique as permissões de storage.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCareerBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `career/${Date.now()}.${fileExt}`;

    try {
      setSaving(true);

      if (USE_MOCK) {
        const fakeUrl = URL.createObjectURL(file);
        setCompanySettings(prev => ({ ...prev, career_page_banner: fakeUrl }));
        toast({ title: "Banner carregado", description: "Modo Demo: Imagem aplicada localmente." });
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      setCompanySettings(prev => ({ ...prev, career_page_banner: publicUrlWithTimestamp }));

      toast({ title: "Banner carregado", description: "Clique em Salvar para confirmar." });
    } catch (error: any) {
      console.error('Error uploading banner:', error);
      toast({ title: "Erro no upload", description: "Verifique as permissões de storage.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addCustomField = () => {
    setCompanySettings(prev => ({
      ...prev,
      employee_custom_fields_config: [
        ...prev.employee_custom_fields_config,
        { id: crypto.randomUUID(), name: '', type: 'text', required: false }
      ]
    }));
  };

  const removeCustomField = (id: string) => {
    setCompanySettings(prev => ({
      ...prev,
      employee_custom_fields_config: prev.employee_custom_fields_config.filter(f => f.id !== id)
    }));
  };

  const updateCustomField = (id: string, key: string, value: any) => {
    setCompanySettings(prev => ({
      ...prev,
      employee_custom_fields_config: prev.employee_custom_fields_config.map(f =>
        f.id === id ? { ...f, [key]: value } : f
      )
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (USE_MOCK) {
        if (activeTab === 'profile') {
          toast({ title: "Perfil salvo", description: "Suas informações foram atualizadas (Modo Demo)." });
        } else if (['company', 'notifications', 'appearance', 'custom_fields', 'career_page'].includes(activeTab)) {
          const payload = {
            company_name: companySettings.company_name,
            cnpj: companySettings.cnpj,
            email: companySettings.email,
            notifications_enabled: companySettings.notifications_enabled,
            avatar_url: companySettings.avatar_url,
            login_background_url: companySettings.login_background_url,
            login_title: companySettings.login_title,
            login_subtitle: companySettings.login_subtitle,
            employee_custom_fields_config: companySettings.employee_custom_fields_config,
            career_page_banner: companySettings.career_page_banner,
            career_page_description: companySettings.career_page_description,
            social_links: companySettings.social_links,
          };
          mockDatabase.set('settings', payload);
          toast({ title: "Configurações salvas", description: "As alterações da empresa foram aplicadas (Modo Demo)." });
        }
        return;
      }

      if (activeTab === 'profile') {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.full_name,
            avatar_url: profileData.avatar_url,
            display_role: profileData.display_role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profileData.id);

        if (error) throw error;
        await refreshProfile(); // Atualiza o contexto global (Sidebar)
        toast({ title: "Perfil salvo", description: "Suas informações de perfil foram atualizadas." });

      } else if (['company', 'notifications', 'appearance', 'custom_fields', 'career_page'].includes(activeTab)) {
        const payload = {
          company_name: companySettings.company_name,
          cnpj: companySettings.cnpj,
          email: companySettings.email,
          notifications_enabled: companySettings.notifications_enabled,
          avatar_url: companySettings.avatar_url,
          login_background_url: companySettings.login_background_url,
          login_title: companySettings.login_title,
          login_subtitle: companySettings.login_subtitle,
          employee_custom_fields_config: companySettings.employee_custom_fields_config,
          career_page_banner: companySettings.career_page_banner,
          career_page_description: companySettings.career_page_description,
          social_links: companySettings.social_links,
          updated_at: new Date().toISOString()
        };

        let error;
        if (companySettings.id) {
          const { error: updateError } = await supabase
            .from('settings')
            .update(payload)
            .eq('id', companySettings.id);
          error = updateError;
        } else {
          // Se não houver settings, insere um novo.
          const { error: insertError } = await supabase
            .from('settings')
            .insert([payload]);
          error = insertError;
        }

        if (error) throw error;
        toast({ title: "Configurações salvas", description: "As alterações da empresa foram aplicadas." });
      }

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
    { id: 'custom_fields', label: 'Campos Extras', icon: ListPlus },
    { id: 'career_page', label: 'Portal de Vagas', icon: Globe },
    { id: 'users', label: 'Usuários & Perm.', icon: Users },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'password', label: 'Trocar Senha', icon: KeyRound },
    { id: 'appearance', label: 'Aparência', icon: Palette },
  ];

  // ── Funções da aba de usuários ────────────────────────
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      if (USE_MOCK) {
        setUserProfiles([
          { id: 'mock-admin-id', full_name: 'Administrador Demo', email: 'admin@empresa.com', role: 'admin', display_role: 'Gerente de RH' },
          { id: '102', full_name: 'Ana do Marketing', email: 'ana.mkt@empresa.com', role: 'manager', display_role: 'Coordenadora de Marketing' },
          { id: '103', full_name: 'João do Financeiro', email: 'joao.fin@empresa.com', role: 'employee', display_role: 'Analista Financeiro' },
        ]);
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, display_role')
        .order('full_name');
      if (error) throw error;
      setUserProfiles(data || []);
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao carregar usuários', variant: 'destructive' });
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingRole(userId);
    try {
      if (USE_MOCK) {
        setUserProfiles(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast({ title: 'Role atualizada (Demo)', description: `Permissão alterada para ${newRole}.` });
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      if (error) throw error;
      setUserProfiles(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast({ title: 'Permissão atualizada!', description: `Role alterada para "${newRole}" com sucesso.` });
    } catch (err) {
      toast({ title: 'Erro ao atualizar role', variant: 'destructive' });
    } finally {
      setSavingRole(null);
    }
  };

  // Carrega usuários ao entrar na aba
  useEffect(() => {
    if (activeTab === 'users') loadUsers();
  }, [activeTab]);

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
                        key={profileData.avatar_url} // Força re-render quando a URL muda
                        src={profileData.avatar_url || "/placeholder.svg"}
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
                      value={profileData.full_name}
                      onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                      placeholder="Ex: [DEV] Marcos Guilherme"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="displayRole">Cargo de Exibição</Label>
                    <Input
                      id="displayRole"
                      value={profileData.display_role}
                      onChange={(e) => setProfileData({ ...profileData, display_role: e.target.value })}
                      placeholder="Ex: Administrador, Gerente de RH"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">E-mail de Login</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      readOnly
                      disabled
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
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center sm:flex-row gap-6">
                  <div className="relative group cursor-pointer" onClick={() => companyLogoRef.current?.click()}>
                    <Avatar className="h-24 w-24 border-2 border-border bg-white p-2">
                      <AvatarImage
                        key={companySettings.avatar_url}
                        src={companySettings.avatar_url}
                        className="object-contain"
                      />
                      <AvatarFallback className="text-2xl">LG</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-8 w-8 text-white" />
                    </div>
                    <input
                      type="file"
                      ref={companyLogoRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleCompanyLogoUpload}
                    />
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-medium">Logo da Empresa</h3>
                    <p className="text-sm text-muted-foreground">
                      Clique na imagem para alterar. Recomendado: Fundo transparente.
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="companyName">Razão Social / Nome Fantasia</Label>
                  <Input
                    id="companyName"
                    value={companySettings.company_name}
                    onChange={(e) => setCompanySettings({ ...companySettings, company_name: e.target.value })}
                    placeholder="Minha Empresa S.A."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    value={companySettings.cnpj}
                    onChange={(e) => setCompanySettings({ ...companySettings, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="companyEmail">E-mail de Contato (Empresa)</Label>
                  <Input
                    id="companyEmail"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                    placeholder="contato@empresa.com.br"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'custom_fields' && (
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Campos Personalizados do Colaborador</CardTitle>
                  <CardDescription>Crie campos adicionais para a ficha de cadastro (ex: Ramal, Placa do Carro, Tamanho da Bota).</CardDescription>
                </div>
                <Button onClick={addCustomField} size="sm" variant="outline" className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" /> Adicionar Campo
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {companySettings.employee_custom_fields_config.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Nenhum campo personalizado configurado.</p>
                ) : (
                  companySettings.employee_custom_fields_config.map((field) => (
                    <div key={field.id} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 p-4 border rounded-lg bg-secondary/20 transition-all hover:bg-secondary/40">
                      <div className="grid gap-2 w-full sm:flex-1">
                        <Label>Nome do Campo</Label>
                        <Input value={field.name} onChange={(e) => updateCustomField(field.id, 'name', e.target.value)} placeholder="Ex: Tamanho do Uniforme" />
                      </div>
                      <div className="grid gap-2 w-full sm:w-[150px]">
                        <Label>Tipo do Dado</Label>
                        <Select value={field.type} onValueChange={(v) => updateCustomField(field.id, 'type', v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Texto / Curto</SelectItem>
                            <SelectItem value="number">Numérico</SelectItem>
                            <SelectItem value="date">Data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 mb-2 sm:mb-0 w-full sm:w-auto">
                        <Switch checked={field.required} onCheckedChange={(c) => updateCustomField(field.id, 'required', c)} />
                        <Label className="text-sm whitespace-nowrap mr-2">Obrigatório</Label>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 mb-0.5" onClick={() => removeCustomField(field.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'career_page' && (
            <Card>
              <CardHeader>
                <CardTitle>Portal de Vagas (Landing Page)</CardTitle>
                <CardDescription>Personalize a página pública onde os candidatos visualizam suas vagas abertas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label>Banner Institucional da Página</Label>
                  <div className="flex items-center gap-4">
                    {companySettings.career_page_banner && (
                      <img src={companySettings.career_page_banner} alt="Banner" className="w-32 h-20 object-cover rounded-md border" />
                    )}
                    <Input type="file" accept="image/*" onChange={handleCareerBannerUpload} className="w-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">Tamanho recomendado: 1200x400px</p>
                </div>

                <div className="grid gap-2">
                  <Label>Sobre a Empresa e a Cultura</Label>
                  <Textarea
                    rows={4}
                    value={companySettings.career_page_description}
                    onChange={(e) => setCompanySettings(prev => ({ ...prev, career_page_description: e.target.value }))}
                    placeholder="Conte um pouco sobre como é trabalhar na sua empresa..."
                  />
                </div>

                <Separator />

                <h3 className="text-sm font-semibold text-foreground">Redes Sociais da Empresa</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Linkedin className="h-4 w-4 text-muted-foreground" /> LinkedIn</Label>
                    <Input
                      value={companySettings.social_links.linkedin}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, social_links: { ...prev.social_links, linkedin: e.target.value } }))}
                      placeholder="https://linkedin.com/company/..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2"><Instagram className="h-4 w-4 text-muted-foreground" /> Instagram</Label>
                    <Input
                      value={companySettings.social_links.instagram}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, social_links: { ...prev.social_links, instagram: e.target.value } }))}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label className="flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground" /> Site Oficial</Label>
                    <Input
                      value={companySettings.social_links.website}
                      onChange={(e) => setCompanySettings(prev => ({ ...prev, social_links: { ...prev.social_links, website: e.target.value } }))}
                      placeholder="https://www.suaempresa.com.br"
                    />
                  </div>
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
                    checked={companySettings.notifications_enabled}
                    onCheckedChange={(c) => setCompanySettings({ ...companySettings, notifications_enabled: c })}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <MfaSetup />
              <ActiveSessionsManager />
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <ChangePassword />
            </div>
          )}

          {activeTab === 'appearance' && (
            <Card>
              <CardHeader>
                <CardTitle>Aparência e Login</CardTitle>
                <CardDescription>Personalize a interface do sistema e a tela de entrada.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mb-8">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Página de Login</h3>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="bgUpload">Imagem de Fundo (Opcional)</Label>
                      <div className="flex items-center gap-4">
                        {companySettings.login_background_url && (
                          <img src={companySettings.login_background_url} alt="Fundo de Login" className="w-32 h-20 object-cover rounded-md border" />
                        )}
                        <Input id="bgUpload" type="file" accept="image/*" onChange={handleCompanyBackgroundUpload} className="w-full" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loginTitle">Título de Boas-vindas</Label>
                      <Input
                        id="loginTitle"
                        value={companySettings.login_title || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, login_title: e.target.value })}
                        placeholder="Ex: Excelência em Gestão de Pessoas"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="loginSubtitle">Subtítulo de Boas-vindas</Label>
                      <Textarea
                        id="loginSubtitle"
                        value={companySettings.login_subtitle || ''}
                        onChange={(e) => setCompanySettings({ ...companySettings, login_subtitle: e.target.value })}
                        placeholder="Ex: Plataforma integrada para otimizar os processos..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Tema do Sistema</h3>
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

          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Instruções para criar novo usuário */}
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
                <div className="flex gap-3">
                  <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Como adicionar novos usuários?</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Por questões de segurança, para criar um novo usuário no sistema real você deve usar o painel do <strong>Supabase &gt; Authentication &gt; Add User</strong>.<br/><br/>
                      Após o usuário ser criado lá (ou fazer login pela primeira vez), ele aparecerá automaticamente na lista abaixo. Então, você poderá definir livremente se o acesso dele é de <strong>Admin</strong>, <strong>Gestor</strong> ou <strong>Colaborador</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Usuários */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Usuários do Sistema
                    </CardTitle>
                    <CardDescription>
                      Gerencie as permissões de acesso de cada usuário.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadUsers} disabled={loadingUsers}>
                    {loadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Atualizar'}
                  </Button>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando usuários...
                    </div>
                  ) : userProfiles.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado.</p>
                  ) : (
                    <div className="space-y-3">
                      {userProfiles.map((u) => (
                        <div
                          key={u.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-lg border bg-secondary/20 hover:bg-secondary/40 transition-colors"
                        >
                          {/* Avatar + info */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {(u.full_name || u.email || '?').substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{u.full_name || '(sem nome)'}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              {u.display_role && (
                                <p className="text-xs text-muted-foreground/70">{u.display_role}</p>
                              )}
                            </div>
                          </div>

                          {/* Badge de role atual */}
                          <div className="flex items-center gap-2">
                            {u.role === 'admin' && (
                              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                                🛡️ Admin
                              </span>
                            )}
                            {u.role === 'manager' && (
                              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                                👔 Gestor
                              </span>
                            )}
                            {(!u.role || u.role === 'employee') && (
                              <span className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                👤 Colaborador
                              </span>
                            )}
                          </div>

                          {/* Selector de role */}
                          <div className="flex items-center gap-2">
                            <Select
                              value={u.role || 'employee'}
                              onValueChange={(val) => handleRoleChange(u.id, val)}
                              disabled={savingRole === u.id}
                            >
                              <SelectTrigger className="w-44 h-8 text-xs">
                                {savingRole === u.id ? (
                                  <span className="flex items-center gap-1">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Salvando...
                                  </span>
                                ) : (
                                  <SelectValue />
                                )}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin — Acesso total</SelectItem>
                                <SelectItem value="manager">Gestor — Portal de Gestores</SelectItem>
                                <SelectItem value="employee">Colaborador — Padrão</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info sobre Service Role Key */}
              {!USE_MOCK && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Convite de Usuários</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        O envio de convites requer a <strong>Service Role Key</strong> do Supabase configurada no backend.
                        A alteração de roles funciona diretamente pela tabela <code>profiles</code>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'users' && (
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
          )}
        </div>
      </div>
    </AppLayout>
  );
}