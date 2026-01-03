import { useState, useEffect, type ChangeEvent } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Bell, Lock, Save, Globe, Mail, Phone, MapPin, Palette } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    companyName: '',
    cnpj: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    theme: 'light',
    notifications: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
      }

      if (data) {
        setFormData({
          id: data.id,
          companyName: data.company_name || '',
          cnpj: data.cnpj || '',
          email: data.email || '',
          phone: data.phone || '',
          website: data.website || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zip_code || '',
          theme: data.theme || 'light',
          notifications: data.notifications_enabled ?? true,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleNotifications = (checked: boolean) => {
    setFormData(prev => ({ ...prev, notifications: checked }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const payload = {
        company_name: formData.companyName,
        cnpj: formData.cnpj,
        email: formData.email,
        phone: formData.phone,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        theme: formData.theme,
        notifications_enabled: formData.notifications,
      };

      let error;
      if (formData.id) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(payload)
          .eq('id', formData.id);
        error = updateError;
      } else {
        const { error: insertError, data } = await supabase
          .from('settings')
          .insert([payload])
          .select()
          .single();
        
        if (data) {
          setFormData(prev => ({ ...prev, id: data.id }));
        }
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configurações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <AppLayout title="Configurações" subtitle="Gerencie as preferências do sistema">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Configurações" subtitle="Gerencie as preferências do sistema">
      <div className="space-y-6 max-w-4xl mx-auto pb-10">
        
        {/* Dados da Empresa */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              <CardTitle>Dados da Empresa</CardTitle>
            </div>
            <CardDescription>Informações institucionais e de identificação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input 
                  id="companyName"
                  name="companyName" 
                  value={formData.companyName} 
                  onChange={handleChange} 
                  placeholder="Ex: Minha Empresa Ltda" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input 
                  id="cnpj"
                  name="cnpj" 
                  value={formData.cnpj} 
                  onChange={handleChange} 
                  placeholder="00.000.000/0000-00" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="website"
                    name="website" 
                    value={formData.website} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="https://..." 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>Endereço e Contato</CardTitle>
            </div>
            <CardDescription>Localização e meios de comunicação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Corporativo</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email"
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="contato@empresa.com" 
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone"
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="pl-9"
                    placeholder="(00) 0000-0000" 
                  />
                </div>
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input 
                  id="address"
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  placeholder="Rua, Número, Bairro" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Cidade</Label>
                <Input 
                  id="city"
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input 
                    id="state"
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange} 
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input 
                    id="zipCode"
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleChange} 
                    placeholder="00000-000"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferências do Sistema */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Aparência e Sistema</CardTitle>
            </div>
            <CardDescription>Personalize a experiência de uso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tema do Sistema</Label>
                <Select value={formData.theme} onValueChange={(v) => handleSelectChange('theme', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Escuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Idioma Padrão</Label>
                <Select defaultValue="pt-BR" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o idioma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notificações</CardTitle>
            </div>
            <CardDescription>Configure como deseja receber alertas.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="notifications" className="text-base">Alertas por Email</Label>
                <div className="text-sm text-muted-foreground">Receber resumos semanais e alertas críticos do sistema.</div>
              </div>
              <Switch 
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={toggleNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Segurança</CardTitle>
            </div>
            <CardDescription>Gerenciamento de acesso e credenciais.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Alterar Senha</Label>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <Lock className="mr-2 h-4 w-4" />
                Redefinir senha de acesso
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex justify-end gap-4">
          <Button variant="ghost">Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading} className="min-w-[140px]">
            {isLoading ? (
                'Salvando...'
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                </>
            )}
          </Button>
        </div>

      </div>
    </AppLayout>
  );
}