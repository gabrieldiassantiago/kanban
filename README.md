# 🎯 Sistema Kanban Pessoal

Um sistema Kanban simples e elegante para organização pessoal de tarefas, com funcionalidade de arrastar e soltar, badges de status, autenticação e integração com Supabase.

## 🚀 Tecnologias Utilizadas

- **Next.js 16** - Framework React para produção
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Supabase** - Backend como serviço (autenticação + banco de dados PostgreSQL)
- **@dnd-kit** - Biblioteca moderna de drag and drop
- **date-fns** - Manipulação de datas

## 📋 Funcionalidades

- ✅ **Autenticação completa** (Login e Registro)
- ✅ **Kanban Board** com 3 colunas: A Fazer, Em Progresso, Concluído
- ✅ **Drag and Drop** entre colunas
- ✅ **CRUD de tarefas** (Criar, Ler, Atualizar, Deletar)
- ✅ **Badges dinâmicos**:
  - Atrasado (tarefas com horário passado)
  - Pendente, Em Progresso, Concluído
  - Urgente, Alta Prioridade
  - Agendado
- ✅ **Campos de tarefa**:
  - Título
  - Descrição
  - Prioridade (Baixa, Média, Alta, Urgente)
  - Horário agendado
  - Status
- ✅ **Arquitetura Clean Code** com POO
- ✅ **Design moderno e responsivo**

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **SOLID**:

```
📁 kanban_gab/
├── 📁 app/                      # Páginas Next.js (App Router)
│   ├── dashboard/page.tsx       # Dashboard principal
│   ├── login/page.tsx          # Página de login
│   ├── register/page.tsx       # Página de registro
│   └── page.tsx                # Página inicial (redirect)
├── 📁 components/               # Componentes React
│   ├── Badge.tsx               # Componente de badge
│   ├── KanbanBoard.tsx         # Board principal com DnD
│   ├── KanbanColumn.tsx        # Coluna do Kanban
│   ├── TaskCard.tsx            # Card de tarefa
│   └── TaskModal.tsx           # Modal de criar/editar
├── 📁 hooks/                    # Hooks personalizados
│   ├── useAuth.ts              # Hook de autenticação
│   └── useTasks.ts             # Hook de gerenciamento de tarefas
├── 📁 lib/                      # Camada de lógica
│   ├── repositories/           # Camada de dados (Repository Pattern)
│   │   ├── ITaskRepository.ts  # Interface do repositório
│   │   └── SupabaseTaskRepository.ts # Implementação Supabase
│   ├── services/               # Camada de negócio (Services)
│   │   ├── AuthService.ts      # Serviço de autenticação
│   │   └── TaskService.ts      # Serviço de tarefas
│   └── supabase.ts             # Cliente Supabase
├── 📁 types/                    # Tipos TypeScript
│   └── index.ts                # Definições de tipos e enums
└── supabase-schema.sql         # Schema do banco de dados
```

### Camadas da Aplicação

1. **Apresentação** (`app/`, `components/`): Interface do usuário
2. **Aplicação** (`hooks/`, `services/`): Regras de negócio
3. **Domínio** (`types/`): Entidades e interfaces
4. **Infraestrutura** (`repositories/`, `lib/supabase.ts`): Acesso a dados

## 🔧 Configuração

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no [Supabase](https://supabase.com)

### 2. Configurar Supabase

1. Crie um novo projeto no Supabase
2. Vá em **SQL Editor**
3. Execute o conteúdo do arquivo `supabase-schema.sql`
4. Copie as credenciais:
   - Vá em **Settings** > **API**
   - Copie a `Project URL` e a `anon public` key

### 3. Configurar Variáveis de Ambiente

1. Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

> Veja o arquivo `env.example.txt` para referência

### 4. Instalar Dependências e Executar

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

Acesse: `http://localhost:3000`

## 📊 Schema do Banco de Dados

### Tabela: `profiles`
- Extensão da tabela `auth.users` do Supabase
- Campos: `id`, `email`, `full_name`, `avatar_url`, `created_at`, `updated_at`

### Tabela: `tasks`
- Armazena todas as tarefas do usuário
- Campos:
  - `id` (UUID)
  - `user_id` (FK para profiles)
  - `title` (TEXT)
  - `description` (TEXT)
  - `status` (ENUM: TODO, IN_PROGRESS, DONE)
  - `priority` (ENUM: LOW, MEDIUM, HIGH, URGENT)
  - `scheduled_time` (TIMESTAMP)
  - `position` (INTEGER) - para ordenação
  - `created_at`, `updated_at`

### Segurança (RLS)
- **Row Level Security (RLS)** habilitado em todas as tabelas
- Usuários só podem acessar/modificar seus próprios dados
- Policies configuradas para SELECT, INSERT, UPDATE e DELETE

## 🎨 Design

O projeto utiliza um design moderno com:
- Gradientes vibrantes
- Sombras suaves e hover effects
- Animações de transição
- Cores semânticas para status
- Interface responsiva

### Paleta de Cores

- **A Fazer**: Cinza (`gray-600`)
- **Em Progresso**: Azul (`blue-600`)
- **Concluído**: Verde (`green-600`)
- **Atrasado**: Vermelho (`red-500`)
- **Urgente**: Laranja (`orange-600`)

## 🔐 Autenticação

A autenticação é gerenciada pelo Supabase Auth:
- E-mail e senha
- Sessão persistente
- Auto-login após registro
- Proteção de rotas

## 🎯 Como Usar

1. **Criar conta**: Acesse `/register` e crie sua conta
2. **Fazer login**: Entre com suas credenciais
3. **Criar tarefa**: Clique em "Nova Tarefa" no dashboard
4. **Arrastar e soltar**: Arraste os cards entre as colunas
5. **Editar/Deletar**: Use os botões nos cards
6. **Ver badges**: Os badges aparecem automaticamente baseados no status, prioridade e horário

## 📝 Tipos de Badges

- **Atrasado** 🔴: Tarefa com horário passado e não concluída
- **Pendente** ⚪: Tarefa em "A Fazer"
- **Em Progresso** 🔵: Tarefa em andamento
- **Concluído** 🟢: Tarefa finalizada
- **Urgente** 🟠: Prioridade urgente
- **Alta** 🟡: Prioridade alta
- **Agendado** 🟣: Tarefa com horário futuro

## 🚀 Deploy

Para fazer deploy, recomendo:

1. **Vercel** (recomendado para Next.js):
   ```bash
   npm install -g vercel
   vercel
   ```
   
2. Configure as variáveis de ambiente no painel da Vercel

3. Ou use qualquer plataforma que suporte Next.js

## 📦 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm start        # Inicia servidor de produção
npm run lint     # Executa o linter
```

## 🤝 Contribuindo

Este é um projeto pessoal, mas sugestões são bem-vindas!

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando Next.js e Supabase**
