# UniGag — protótipo React

Componente completo e independente para análise visual ou execução por outra IA.

## Arquivos

- `UniGagPrototype.tsx`: aplicação React interativa completa.
- `UniGagPrototype.css`: design system, temas e responsividade.

## Dependências

```bash
npm install react react-dom lucide-react recharts
```

## Uso

```tsx
import UniGagPrototype from './UniGagPrototype'

export default function App() {
  return <UniGagPrototype />
}
```

O componente abre na tela de login. Clique em **Entrar no UniGag** para acessar a dashboard.
Use o item **Gag Squad** no menu lateral para visualizar a experiência social.

Também é possível abrir estados específicos por query string:

- `?screen=login`
- `?screen=dashboard&theme=light`
- `?screen=squad&theme=pride`

Os dados demonstrativos estão incluídos no próprio componente exportado. Não é necessário Payload ou Next.js para visualizar o protótipo.
