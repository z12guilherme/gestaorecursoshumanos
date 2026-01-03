import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Plus, Star, TrendingUp, Users, Target, Trash2, X } from 'lucide-react';
import { usePerformance, Goal, Competency } from '@/hooks/usePerformance';
import { useEmployees } from '@/hooks/useEmployees';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';

export default function Performance() {
  const { reviews, loading: loadingReviews, addReview, deleteReview } = usePerformance();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    employee_id: string;
    reviewer_id: string;
    period: string;
    goals: Goal[];
    competencies: Competency[];
    feedback: string;
  }>({
    employee_id: '',
    reviewer_id: '',
    period: '01 - 2026',
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

  const handleSave = async () => {
    if (!formData.employee_id || !formData.reviewer_id) {
      toast({ title: "Erro", description: "Selecione o colaborador e o avaliador.", variant: "destructive" });
      return;
    }

    const overall_score = calculateOverallScore();

    const { error } = await addReview({
      ...formData,
      overall_score
    });

    if (error) {
      toast({ title: "Erro", description: "Falha ao salvar avaliação.", variant: "destructive" });
      return;
    }

    toast({ title: "Sucesso", description: "Avaliação registrada com sucesso." });
    setIsDialogOpen(false);
    // Reset form
    setFormData({
      employee_id: '',
      reviewer_id: '',
      period: '01 - 2026',
      goals: [{ description: '', achieved: false, score: 0 }],
      competencies: [
        { name: 'Comunicação', score: 0 },
        { name: 'Trabalho em Equipe', score: 0 },
        { name: 'Proatividade', score: 0 },
        { name: 'Liderança', score: 0 }
      ],
      feedback: ''
    });
  };

  const handleDelete = async (id: string) => {
    await deleteReview(id);
    toast({ title: "Avaliação excluída", description: "O registro foi removido." });
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

  const updateGoal = (index: number, field: keyof Goal, value: any) => {
    const newGoals = [...formData.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setFormData(prev => ({ ...prev, goals: newGoals }));
  };

  const updateCompetency = (index: number, score: number) => {
    const newComps = [...formData.competencies];
    newComps[index] = { ...newComps[index], score };
    setFormData(prev => ({ ...prev, competencies: newComps }));
  };

  const loading = loadingReviews || loadingEmployees;

  // Stats Calculation
  const averageScore = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + Number(curr.overall_score), 0) / reviews.length).toFixed(1)
    : '0.0';
  
  const goalsMet = reviews.reduce((acc, curr) => acc + curr.goals.filter(g => g.achieved).length, 0);
  const totalGoals = reviews.reduce((acc, curr) => acc + curr.goals.length, 0);
  const goalsPercentage = totalGoals > 0 ? Math.round((goalsMet / totalGoals) * 100) : 0;

  return (
    <AppLayout title="Avaliação de Desempenho" subtitle="Ciclos de avaliação e feedbacks">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">01 - 2026</p>
                <p className="text-xs text-muted-foreground">Ciclo atual</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                <p className="text-xs text-muted-foreground">Total de Colaboradores</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{averageScore}</p>
                <p className="text-xs text-muted-foreground">Média geral</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{goalsPercentage}%</p>
                <p className="text-xs text-muted-foreground">Metas atingidas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Avaliações Recentes</h2>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Avaliação
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Nova Avaliação de Desempenho</DialogTitle>
                <DialogDescription>
                  Preencha os dados da avaliação. A nota geral será calculada automaticamente.
                </DialogDescription>
              </DialogHeader>
              
              <ScrollArea className="flex-1 pr-4">
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Colaborador</Label>
                      <Select 
                        value={formData.employee_id} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, employee_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Avaliador</Label>
                      <Select 
                        value={formData.reviewer_id} 
                        onValueChange={(v) => setFormData(prev => ({ ...prev, reviewer_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map(emp => (
                            <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
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

                  <div className="grid gap-2">
                    <Label>Feedback Geral</Label>
                    <Textarea 
                      value={formData.feedback}
                      onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                      placeholder="Comentários sobre o desempenho..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="font-semibold">Nota Geral Calculada:</span>
                    <span className="text-2xl font-bold text-primary">{calculateOverallScore().toFixed(1)}</span>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleSave}>Salvar Avaliação</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-10">Carregando avaliações...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow relative group">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(review.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between pr-8">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {review.employee_name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{review.employee_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Avaliado por {review.reviewer_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{review.period}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Overall Score */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Nota geral</span>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(review.overall_score)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                      <span className="font-semibold text-foreground ml-2">
                        {Number(review.overall_score).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Goals Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Metas atingidas</span>
                      <span className="font-medium text-foreground">
                        {review.goals.filter(g => g.achieved).length}/{review.goals.length}
                      </span>
                    </div>
                    <Progress 
                      value={review.goals.length > 0 ? (review.goals.filter(g => g.achieved).length / review.goals.length) * 100 : 0}
                      className="h-2"
                    />
                  </div>

                  {/* Competencies */}
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Competências</span>
                    <div className="flex flex-wrap gap-2">
                      {review.competencies.map((comp, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {comp.name}
                          <span className="font-semibold">{comp.score}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Feedback Preview */}
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    "{review.feedback}"
                  </p>
                </CardContent>
              </Card>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                Nenhuma avaliação encontrada. Clique em "Nova Avaliação" para começar.
              </div>
            )}
          </div>
        )}

        {/* Employees to Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colaboradores (Sugestão para Avaliação)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {employees.slice(0, 8).map((employee) => (
                <div 
                  key={employee.id} 
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, employee_id: employee.id }));
                    setIsDialogOpen(true);
                  }}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{employee.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{employee.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
