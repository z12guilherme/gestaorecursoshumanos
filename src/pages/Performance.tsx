import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Plus, Star, TrendingUp, Users, Target } from 'lucide-react';
import { performanceReviews, employees } from '@/data/mockData';

export default function Performance() {
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
                <p className="text-2xl font-bold text-foreground">2024-S1</p>
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
                <p className="text-2xl font-bold text-foreground">45</p>
                <p className="text-xs text-muted-foreground">Avaliações pendentes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.2</p>
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
                <p className="text-2xl font-bold text-foreground">78%</p>
                <p className="text-xs text-muted-foreground">Metas atingidas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Avaliações Recentes</h2>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Avaliação
          </Button>
        </div>

        {/* Reviews List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {performanceReviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.employeeName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{review.employeeName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Avaliado por {review.reviewerName}
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
                          i < Math.round(review.overallScore)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                    <span className="font-semibold text-foreground ml-2">
                      {review.overallScore.toFixed(1)}
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
                    value={(review.goals.filter(g => g.achieved).length / review.goals.length) * 100}
                    className="h-2"
                  />
                </div>

                {/* Competencies */}
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Competências</span>
                  <div className="flex flex-wrap gap-2">
                    {review.competencies.map((comp) => (
                      <Badge 
                        key={comp.name} 
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
        </div>

        {/* Employees to Review */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Colaboradores Pendentes de Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {employees.slice(0, 4).map((employee) => (
                <div key={employee.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors cursor-pointer">
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
