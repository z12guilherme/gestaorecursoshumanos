# Guia de Contribuição

Obrigado pelo interesse em contribuir para o Sistema de Gestão de Recursos Humanos (GestaoRH)!

## Como Contribuir

1.  **Faça um Fork** do repositório.
2.  Crie uma **Branch** para sua Feature ou Correção (`git checkout -b feature/MinhaFeature`).
3.  Faça o **Commit** de suas mudanças (`git commit -m 'Adiciona nova funcionalidade X'`).
4.  Faça o **Push** para a Branch (`git push origin feature/MinhaFeature`).
5.  Abra um **Pull Request** descrevendo suas alterações.

## Padrões de Desenvolvimento

### Estrutura de Código
- **Componentes**: Utilize componentes funcionais do React e mantenha-os pequenos e reutilizáveis.
- **Hooks**: A lógica de acesso a dados deve residir em custom hooks dentro de `src/hooks`.
- **Tipagem**: Utilize TypeScript para todas as definições. Evite o uso de `any`.

### Estilização
- Utilize **Tailwind CSS** para estilização.
- Para componentes de UI complexos, prefira utilizar/estender os componentes do **shadcn/ui** já instalados em `src/components/ui`.

### Banco de Dados
- Ao criar novas tabelas ou alterar esquemas, inclua o SQL correspondente na descrição do seu Pull Request.

## Reportando Bugs

Utilize a aba de **Issues** do GitHub para reportar bugs. Certifique-se de incluir:
- Passos para reproduzir o erro.
- Comportamento esperado vs. comportamento atual.
- Screenshots (se aplicável).