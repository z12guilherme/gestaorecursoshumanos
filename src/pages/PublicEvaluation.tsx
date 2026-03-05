import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, AlertCircle, Loader2, User, Calendar, Star, Plus, X } from 'lucide-react';

export default function PublicEvaluation() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [valid, setValid] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    period: '',
    goals: [{ description: '', achieved: false, score: 0 }],
    competencies: [
      { name: 'Comunicação', score: 0 },
      { name: 'Trabalho em Equipe', score: 0 },
      { name: 'Proatividade', score: 0 },
      { name: 'Liderança', score: 0 }
    ],
    feedback: ''
  });

  const calculateOverallScore = () => {
    const goalScores = formData.goals.map(g => Number(g.score) || 0);
    const compScores = formData.competencies.map(c => Number(c.score) || 0);
    const allScores = [...goalScores, ...compScores].filter(score => score > 0);
    
    if (allScores.length === 0) return 0;
    const sum = allScores.reduce((a, b) => a + b, 0);
    return (sum / allScores.length);
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { description: '', achieved: false, score: 0 }]
    }));
  };

  const removeGoal = (index: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const updateGoal = (index: number, field: string, value: any) => {
    const newGoals = [...formData.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setFormData(prev => ({ ...prev, goals: newGoals }));
  };

  const updateCompetency = (index: number, score: number) => {
    const newComps = [...formData.competencies];
    newComps[index] = { ...newComps[index], score };
    setFormData(prev => ({ ...prev, competencies: newComps }));
  };

  useEffect(() => {
    async function validateToken() {
      if (!token) return;
      try {
        // Consulta direta à tabela (permitida pelo RLS para tokens pendentes)
        const { data, error } = await supabase
          .from('evaluation_tokens')
          .select('*')
          .eq('token', token)
          .maybeSingle();
        
        if (error) throw error;
        
        // Verifica validade manualmente
        if (data && data.status === 'pending' && new Date(data.expires_at) > new Date()) {
          setValid(true);
          // Adiciona o período atual já que não vem do banco nessa consulta
          const period = new Date().toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
          setDetails({ ...data, period });
          setFormData(prev => ({ ...prev, period }));
        } else {
          setValid(false);
        }
      } catch (err) {
        console.error(err);
        setValid(false);
      } finally {
        setLoading(false);
      }
    }
    validateToken();
  }, [token]);

  const handleSubmit = async () => {
    if (!formData.feedback) {
      toast({ title: "Campos obrigatórios", description: "Preencha o feedback geral.", variant: "destructive" });
      return;
    }

    const overall_score = calculateOverallScore();

    setSubmitting(true);
    try {
      const { error } = await supabase.rpc('submit_public_evaluation', {
        token_input: token,
        overall_score: overall_score,
        feedback_text: formData.feedback,
        competencies_data: formData.competencies
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "Sucesso!", description: "Avaliação enviada com sucesso." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Falha ao enviar avaliação.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!valid || submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
              {submitted ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <AlertCircle className="h-8 w-8 text-red-600" />}
            </div>
            <CardTitle>{submitted ? "Avaliação Recebida!" : "Link Inválido ou Expirado"}</CardTitle>
            <CardDescription>
              {submitted 
                ? "Obrigado por completar a avaliação de desempenho." 
                : "Este link de avaliação não é mais válido ou já foi utilizado."}
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            {submitted && <Button variant="outline" onClick={() => window.close()}>Pode fechar esta janela</Button>}
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Avaliação de Desempenho</h1>
          <p className="text-slate-500">Portal do Coordenador</p>
        </div>

        <Card>
          <CardHeader className="bg-slate-100/50 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Nova Avaliação de Desempenho</CardTitle>
              <div className="bg-white p-2 rounded-full border"><User className="h-5 w-5 text-primary" /></div>
            </div>
            <CardDescription>Preencha os dados da avaliação. A nota geral será calculada automaticamente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-medium">{details?.employee_name}</div>
              </div>
              <div className="space-y-2">
                <Label>Avaliador</Label>
                <div className="p-3 bg-muted rounded-md text-sm font-medium">{details?.reviewer_name}</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Input 
                value={formData.period} 
                onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value }))} 
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Metas e Objetivos</Label>
                <Button variant="outline" size="sm" onClick={addGoal}>
                  <Plus className="h-3 w-3 mr-1" /> Adicionar Meta
                </Button>
              </div>
              {formData.goals.map((goal, index) => (
                <div key={index} className="grid gap-3 p-3 border rounded-lg bg-muted/20 relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => removeGoal(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="grid gap-2">
                    <Label>Descrição da Meta</Label>
                    <Input 
                      value={goal.description} 
                      onChange={(e) => updateGoal(index, 'description', e.target.value)}
                      placeholder="Ex: Entregar projeto X"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={goal.achieved}
                        onCheckedChange={(c) => updateGoal(index, 'achieved', c)}
                      />
                      <Label>Atingida?</Label>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Label>Nota</Label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 cursor-pointer transition-colors ${
                              star <= goal.score
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-muted-foreground/30 hover:text-amber-400'
                            }`}
                            onClick={() => updateGoal(index, 'score', star)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Competências</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {formData.competencies.map((comp, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-muted/20">
                    <div className="flex justify-between items-center mb-2">
                      <Label>{comp.name}</Label>
                      <span className="font-bold text-lg">{comp.score}</span>
                    </div>
                    <div className="flex gap-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-8 w-8 cursor-pointer transition-colors ${
                            star <= comp.score
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30 hover:text-amber-400'
                          }`}
                          onClick={() => updateCompetency(index, star)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Feedback Geral</Label>
              <Textarea 
                placeholder="Comentários sobre o desempenho..." 
                className="min-h-[100px]"
                value={formData.feedback}
                onChange={e => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <span className="font-semibold">Nota Geral Calculada:</span>
              <span className="text-2xl font-bold text-primary">{calculateOverallScore().toFixed(1)}</span>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="w-full" onClick={() => window.close()}>
                Cancelar
              </Button>
              <Button className="w-full" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}