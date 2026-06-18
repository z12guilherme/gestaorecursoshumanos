import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const meta: Meta<typeof Avatar> = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ComImagem: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  ),
};

export const SemImagem: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>JS</AvatarFallback>
    </Avatar>
  ),
};

export const Iniciais: Story = {
  render: () => (
    <div className="flex gap-2">
      {["JS", "MA", "PO", "LF", "CB"].map((initials) => (
        <Avatar key={initials}>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
