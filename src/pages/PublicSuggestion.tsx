// c:\Users\santa fe\Desktop\gestaorecursoshumanos\src\pages\PublicSuggestion.tsx
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PublicSuggestion() {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('suggestions').insert([
        {
          customer_name: name,
          contact_info: contact,
          content: content,
        },
      ]);

      if (error) throw error;
      setSubmitted(true);
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error);
      alert('Erro ao enviar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Obrigado!</h2>
          <p className="text-slate-600">
            Sua sugestão foi recebida com sucesso. Agradecemos por contribuir para a melhoria dos nossos serviços.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ouvidoria & Sugestões</CardTitle>
          <CardDescription>Envie sua opinião diretamente para nossa equipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome (Opcional)</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contato (Email/Tel - Opcional)</label>
              <Input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Para retornarmos o contato"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sua Sugestão ou Reclamação *</label>
              <Textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Descreva aqui sua experiência..."
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Enviando...' : (
                <>
                  <Send className="h-4 w-4 mr-2" /> Enviar Sugestão
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
