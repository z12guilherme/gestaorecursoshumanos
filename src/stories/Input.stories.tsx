import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "date"],
    },
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Nome completo",
    type: "text",
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email">E-mail corporativo</Label>
      <Input type="email" id="email" placeholder="joao@empresa.com.br" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Campo desabilitado",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Senha",
  },
};
