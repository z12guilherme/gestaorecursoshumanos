import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof Badge> = {
  title: "UI/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline"],
      description: "Variante visual do badge",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Ativo: Story = {
  args: { children: "Ativo", variant: "default" },
};

export const Ferias: Story = {
  args: { children: "Férias", variant: "secondary" },
};

export const Desligado: Story = {
  args: { children: "Desligado", variant: "destructive" },
};

export const Pendente: Story = {
  args: { children: "Pendente", variant: "outline" },
};
