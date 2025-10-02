# 💰 Controle de Gastos Sergio Sena

Uma aplicação web moderna e intuitiva para controle financeiro pessoal, desenvolvida com tecnologias front-end puras e hospedada na AWS.

## 🚀 Demonstração

**Site em produção:** [financaspessoais.sstechnologies-cloud.com](http://financaspessoais.sstechnologies-cloud.com)

## 📋 Sobre o Projeto

O **Controle de Gastos Sergio Sena** é uma aplicação web completa para gerenciamento de finanças pessoais que permite:

- ✅ Controle de receitas e despesas
- 📊 Visualização de dados através de gráficos interativos
- 💾 Armazenamento local dos dados (LocalStorage)
- 🎯 Gestão de reserva de emergência
- 🧮 Calculadora integrada
- 📱 Interface responsiva para dispositivos móveis

## 🛠️ Tecnologias Utilizadas

### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Estilização moderna com gradientes e glassmorphism
- **JavaScript (ES6+)** - Lógica da aplicação
- **Chart.js** - Gráficos interativos

### Infraestrutura AWS
- **Amazon S3** - Hospedagem de site estático
- **Route 53** - Gerenciamento de DNS
- **AWS CLI** - Automação de deploy

## 🎯 Funcionalidades

### 📊 Dashboard
- Resumo financeiro do mês atual
- Gráfico comparativo dos últimos 6 meses
- Visualização de gastos por categoria
- Controle de reserva de emergência com meta automática
- Lista dos últimos lançamentos

### 💸 Lançamentos
- Cadastro de receitas e despesas
- Categorização de gastos (11 categorias disponíveis)
- Marcação de despesas recorrentes
- Edição e exclusão de lançamentos
- Filtros por mês e ordenação
- Detecção de lançamentos duplicados

### 🧮 Calculadora
- Calculadora funcional integrada
- Suporte a operações básicas
- Controle via teclado numérico
- Interface moderna e responsiva

### 🔧 Recursos Técnicos
- Armazenamento local persistente
- Interface responsiva (mobile-first)
- Notificações visuais
- Validação de formulários
- Navegação por abas

## 📁 Estrutura do Projeto

```
controle-de-gastos-sergiosena/
├── index.html              # Página principal
├── styles.css              # Estilos da aplicação
├── script.js               # Lógica JavaScript
├── deploy.bat              # Script de deploy para Windows
├── deploy.sh               # Script de deploy para Linux/Mac
├── bucket-policy.json      # Política do bucket S3
├── dns-change.json         # Configuração DNS
├── fix-dns.bat            # Script para correção de DNS
└── README.md              # Documentação do projeto
```

## 🚀 Como Executar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/controle-de-gastos-sergiosena.git
   cd controle-de-gastos-sergiosena
   ```

2. **Abra o arquivo `index.html` em um navegador web**
   - Ou use um servidor local como Live Server (VS Code)
   - Ou Python: `python -m http.server 8000`

3. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

## ☁️ Deploy na AWS

### Pré-requisitos
- AWS CLI configurado
- Domínio registrado no Route 53
- Permissões adequadas no IAM

### Deploy Automático

**Windows:**
```batch
deploy.bat
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

### Deploy Manual

1. **Criar bucket S3:**
   ```bash
   aws s3 mb s3://seu-dominio.com --region us-east-1
   ```

2. **Configurar website hosting:**
   ```bash
   aws s3 website s3://seu-dominio.com --index-document index.html
   ```

3. **Aplicar política pública:**
   ```bash
   aws s3api put-bucket-policy --bucket seu-dominio.com --policy file://bucket-policy.json
   ```

4. **Upload dos arquivos:**
   ```bash
   aws s3 sync . s3://seu-dominio.com --exclude "*.bat" --exclude "*.json"
   ```

## 📊 Categorias de Gastos

O sistema oferece 11 categorias pré-definidas:

- 🍽️ **Alimentação** - Supermercado, restaurantes, delivery
- 🚗 **Transporte** - Combustível, transporte público, manutenção
- 🏠 **Casa** - Aluguel, condomínio, manutenção doméstica
- 💊 **Saúde** - Medicamentos, consultas, planos de saúde
- 🎮 **Lazer** - Entretenimento, hobbies, viagens
- 👕 **Roupas** - Vestuário e acessórios
- 🌐 **Internet/Fibra** - Provedores de internet
- 📱 **Telefone Móvel** - Planos de celular
- 💳 **Cartão de Crédito** - Faturas e anuidades
- 📚 **Estudos** - Cursos, livros, educação
- 📦 **Outros** - Gastos diversos

## 🔮 Futuras Melhorias

### 🎯 Versão 2.0 - Recursos Avançados
- [ ] **Metas Financeiras**
  - Definição de objetivos mensais/anuais
  - Acompanhamento de progresso
  - Alertas de limite de gastos

- [ ] **Relatórios Avançados**
  - Exportação para PDF/Excel
  - Relatórios personalizáveis
  - Análise de tendências

- [ ] **Planejamento Financeiro**
  - Projeções futuras
  - Simulador de investimentos
  - Calculadora de aposentadoria

### 🔐 Versão 3.0 - Backend e Segurança
- [ ] **Sistema de Autenticação**
  - Login/cadastro de usuários
  - Recuperação de senha
  - Autenticação via Google/Facebook

- [ ] **Backend na AWS**
  - API REST com Lambda + API Gateway
  - Banco de dados DynamoDB
  - Sincronização multi-dispositivo

- [ ] **Recursos Colaborativos**
  - Compartilhamento de orçamentos familiares
  - Múltiplos usuários por conta
  - Permissões granulares

### 📱 Versão 4.0 - Mobile e Integrações
- [ ] **Aplicativo Mobile**
  - App nativo iOS/Android
  - Notificações push
  - Modo offline

- [ ] **Integrações Bancárias**
  - Importação automática de extratos
  - Categorização inteligente via IA
  - Open Banking (PIX)

- [ ] **Recursos Inteligentes**
  - IA para análise de gastos
  - Sugestões personalizadas
  - Detecção de padrões

### 🌟 Versão 5.0 - Recursos Premium
- [ ] **Análises Avançadas**
  - Machine Learning para previsões
  - Comparação com médias nacionais
  - Insights personalizados

- [ ] **Integração com Investimentos**
  - Acompanhamento de carteira
  - Análise de rentabilidade
  - Rebalanceamento automático

- [ ] **Consultoria Financeira**
  - Chat com especialistas
  - Planos financeiros personalizados
  - Educação financeira gamificada

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Sergio Sena**
- Website: [sstechnologies.com](https://sstechnologies.com)
- Email: contato@sstechnologies.com

## 🙏 Agradecimentos

- [Chart.js](https://www.chartjs.org/) - Biblioteca de gráficos
- [AWS](https://aws.amazon.com/) - Infraestrutura de hospedagem
- Comunidade open source por inspirações e recursos

---

⭐ **Se este projeto te ajudou, considere dar uma estrela no repositório!**