# 🤖 SmartFinance - Assistente Financeiro com IA

Aplicação web moderna de controle financeiro pessoal com integração Open Finance e análise por Inteligência Artificial.

## 🚀 Tecnologias

### Backend
- **Node.js + Express** - API REST
- **MongoDB Atlas** - Banco de dados em nuvem
- **JWT** - Autenticação segura
- **Pluggy API** - Integração Open Finance (67+ bancos)
- **Google Gemini** - Análise financeira com IA
- **bcrypt** - Criptografia de senhas

### Frontend
- **React 18 + TypeScript** - Interface moderna
- **Vite** - Build tool rápido
- **Chart.js** - Gráficos interativos
- **CSS Variables** - Design system completo
- **Glassmorphism** - UI moderna e elegante

## 📋 Funcionalidades

### 🎉 Versão 2.0 - Landing Page & Validações (Atual)

### 🎨 Landing Page Profissional
- **Hero Section**: Título impactante, subtítulo, 2 CTAs principais
- **Features Section**: 4 cards com ícones (Análise Inteligente, Open Finance, Alertas, IA)
- **Pricing Section**: 3 planos (Free, Pro R$49, Business R$99) com destaque
- **CTA Final**: Seção com gradiente e call-to-action forte
- **Footer**: Logo + copyright
- **Header Sticky**: Logo + botão CTA sempre visível
- **Roteamento**: Landing → Auth → Dashboard

### 🔐 Validações de Segurança
- **Email**: Regex validation com feedback visual em tempo real
- **Senha**: Mínimo 6 caracteres obrigatório
- **Força da Senha**: Indicador (8+ caracteres, 1 maiúscula, 1 número)
- **Confirmação**: Campo adicional no registro com validação de correspondência
- **Feedback Visual**: ✓ verde (válido), ✗ vermelho (inválido), ⚠️ aviso
- **Botão Inteligente**: Desabilitado se dados inválidos

### 🎯 Ícones Modernos (Lucide React)
- Substituídos todos emojis por ícones profissionais
- Dashboard: TrendingUp, DollarSign, TrendingDown, CheckCircle, AlertCircle, BarChart3, PieChart, Building2, Plus, LogOut, Inbox
- Auth: Mail, Lock, LogIn, UserPlus, Loader2, Sparkles, User
- Landing: Shield, Zap, ArrowRight, Check

### ✨ Micro-animações
- `.hover-lift`: Elevação de cards ao hover
- `.hover-scale`: Escala ao hover
- `.hover-glow`: Efeito neon ao hover
- `.skeleton`: Loading state com shimmer
- `animate-fadeIn`, `animate-slideUp`: Animações de entrada
- `.stagger-item`: Animações em cascata

## 🎆 Versão 1.0 - Dashboard Completo

### ✅ Implementado
- 🔐 **Autenticação completa** (Login/Registro com JWT)
- 💰 **Gestão de transações** (Receitas e Despesas)
- 📊 **Dashboard interativo** com cards de resumo
- 📈 **Gráficos dinâmicos** (Gastos por categoria)
- 🎨 **Tema claro/escuro** com persistência
- 🏦 **Modal de conexão bancária** (67+ bancos)
- 📱 **Design responsivo** (Mobile-first)
- 🎯 **10 categorias** de gastos pré-definidas

### 🚧 Em Desenvolvimento
- 🔗 **Integração real Pluggy Connect Widget**
- 🤖 **Análise IA com Google Gemini**
- 📥 **Importação automática de transações**

## 🎨 Design System

### Cores Principais
- **Primary**: Azul confiança (#0284c7)
- **Secondary**: Verde crescimento (#10b981)
- **Accent**: Cyan tech (#06b6d4) + Magenta (#ec4899)

### Temas
- ☀️ **Light Mode**: Fundo claro, números escuros
- 🌙 **Dark Mode**: Fundo escuro (#0a0e1a), números claros

### Componentes UI
- **Button**: 5 variantes, 3 tamanhos, loading states
- **Card**: Glassmorphism com hover effects
- **Modal**: Backdrop blur, animações suaves

## 📁 Estrutura do Projeto

```
smartfinance/
├── backend/
│   ├── config/
│   │   └── database.js          # Conexão MongoDB
│   ├── middleware/
│   │   └── auth.js              # Middleware JWT
│   ├── models/
│   │   ├── User.js              # Schema de usuário
│   │   └── Transaction.js       # Schema de transação
│   ├── routes/
│   │   ├── auth.js              # Rotas de autenticação
│   │   ├── transactions.js      # Rotas de transações
│   │   └── pluggy.js            # Rotas Open Finance
│   ├── scripts/
│   │   ├── clearTransactions.js # Limpar transações
│   │   └── clearDatabase.js     # Limpar banco completo
│   ├── services/
│   │   └── pluggy.js            # Cliente Pluggy API
│   ├── .env                     # Variáveis de ambiente
│   ├── server.js                # Servidor Express
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── Button.tsx       # Componente botão
    │   │   │   ├── Card.tsx         # Componente card
    │   │   │   ├── Modal.tsx        # Componente modal
    │   │   │   └── index.ts         # Exports
    │   │   ├── Dashboard.tsx        # Dashboard principal
    │   │   ├── Login.tsx            # Tela de login
    │   │   ├── Register.tsx         # Tela de registro
    │   │   ├── ThemeToggle.tsx      # Toggle de tema
    │   │   ├── FinanceChart.tsx     # Gráficos Chart.js
    │   │   └── TransactionForm.tsx  # Formulário de transação
    │   ├── contexts/
    │   │   └── AuthContext.tsx      # Context de autenticação
    │   ├── services/
    │   │   ├── api.ts               # Cliente Axios
    │   │   ├── auth.ts              # Serviço de auth
    │   │   ├── transactions.ts      # Serviço de transações
    │   │   └── pluggy.ts            # Serviço Pluggy
    │   ├── styles/
    │   │   ├── tokens.css           # Design tokens
    │   │   ├── animations.css       # Animações
    │   │   ├── utilities.css        # Classes utilitárias
    │   │   └── index.css            # Reset global
    │   ├── App.tsx                  # Componente raiz
    │   ├── main.tsx                 # Entry point
    │   └── vite-env.d.ts
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- MongoDB Atlas (ou local)
- Conta Pluggy (API Key)
- Conta Google Cloud (Gemini API Key)

### 1. Backend

```bash
cd smartfinance/backend
npm install

# Configurar .env
cp .env.example .env
# Editar .env com suas credenciais

npm run dev
# Servidor rodando em http://localhost:5000
```

### 2. Frontend

```bash
cd smartfinance/frontend
npm install
npm run dev
# App rodando em http://localhost:5173
```

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smartfinance
JWT_SECRET=seu_secret_super_seguro_aqui

# Pluggy API
PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret
PLUGGY_USE_SIMULATOR=false
PLUGGY_PREFER_REAL=true

# Google Gemini
GEMINI_API_KEY=sua_api_key_gemini
```

## 📊 Categorias de Gastos

1. 🍽️ **Alimentação** - Supermercado, restaurantes
2. 🚗 **Transporte** - Combustível, transporte público
3. 🏠 **Moradia** - Aluguel, condomínio
4. 💊 **Saúde** - Medicamentos, consultas
5. 📚 **Educação** - Cursos, livros
6. 🎮 **Lazer** - Entretenimento, viagens
7. 🛍️ **Compras** - Vestuário, eletrônicos
8. 💳 **Contas** - Água, luz, internet
9. 💰 **Investimentos** - Ações, fundos
10. 📦 **Outros** - Diversos

## 🛠️ Scripts Úteis

### Backend
```bash
# Limpar apenas transações
node scripts/clearTransactions.js

# Limpar banco completo (usuários + transações)
node scripts/clearDatabase.js
```

### Frontend
```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

## 🎯 Próximos Passos

### Curto Prazo
- [ ] Implementar Pluggy Connect Widget real
- [ ] Adicionar análise IA com Gemini
- [ ] Criar página de configurações
- [ ] Adicionar filtros de data no dashboard

### Médio Prazo
- [ ] Implementar metas financeiras
- [ ] Adicionar notificações push
- [ ] Criar relatórios exportáveis (PDF)
- [ ] Implementar categorias customizadas

### Longo Prazo
- [ ] App mobile (React Native)
- [ ] Integração com PIX
- [ ] Marketplace de investimentos
- [ ] Gamificação e conquistas

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - Sergio Sena © 2024

## 👨‍💻 Autor

**Sergio Sena**
- Website: [sstechnologies.com](https://sstechnologies.com)
- Email: contato@sstechnologies.com
- GitHub: [@sergiosena](https://github.com/sergiosena)

---

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
