import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "Variante visual do botão",
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
      description: "Tamanho do botão",
    },
    disabled: {
      control: "boolean",
      description: "Desabilita o botão",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Salvar",
    variant: "default",
  },
};

export const Destructive: Story = {
  args: {
    children: "Excluir colaborador",
    variant: "destructive",
  },
};

export const Outline: Story = {
  args: {
    children: "Cancelar",
    variant: "outline",
  },
};

export const Secondary: Story = {
  args: {
    children: "Ver detalhes",
    variant: "secondary",
  },
};

export const Ghost: Story = {
  args: {
    children: "Ignorar",
    variant: "ghost",
  },
};

export const Small: Story = {
  args: {
    children: "Aprovar",
    variant: "default",
    size: "sm",
  },
};

export const Large: Story = {
  args: {
    children: "Gerar Folha de Pagamento",
    variant: "default",
    size: "lg",
  },
};

export const Disabled: Story = {
  args: {
    children: "Processando...",
    variant: "default",
    disabled: true,
  },
};
