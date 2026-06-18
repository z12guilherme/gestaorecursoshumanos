import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ColaboradorCard: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>João Silva</CardTitle>
          <Badge variant="default">Ativo</Badge>
        </div>
        <CardDescription>Analista de TI · Departamento de Tecnologia</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Admitido em 15/03/2023 · Salário: R$ 5.200,00
        </p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline" size="sm">Ver Perfil</Button>
        <Button size="sm">Editar</Button>
      </CardFooter>
    </Card>
  ),
};

export const KpiCard: Story = {
  render: () => (
    <Card className="w-[200px]">
      <CardHeader className="pb-2">
        <CardDescription>Total de Colaboradores</CardDescription>
        <CardTitle className="text-4xl">142</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">+3 este mês</p>
      </CardContent>
    </Card>
  ),
};
