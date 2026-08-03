import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          to="/entrar"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o Login
        </Link>
        <div className="bg-card p-8 md:p-12 rounded-xl border shadow-sm">
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground mt-0 mb-8">
              Última atualização: {lastUpdated}
            </p>
            <div className="text-justify leading-relaxed">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
