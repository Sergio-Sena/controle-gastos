# 🌐 Configuração da Sincronização Automática

## 📋 Passo a Passo

### 1️⃣ **Criar Token GitHub (uma vez só)**

1. Acesse: [github.com/settings/tokens](https://github.com/settings/tokens)
2. Clique em **"Generate new token (classic)"**
3. Preencha:
   - **Note**: `Financas Pessoais App`
   - **Expiration**: `No expiration` (ou 1 ano)
   - **Scopes**: Marque apenas `gist` ✅
4. Clique **"Generate token"**
5. **COPIE O TOKEN** (aparece só uma vez!)

### 2️⃣ **Configurar no App**

1. Abra: [financaspessoais.sstechnologies-cloud.com](http://financaspessoais.sstechnologies-cloud.com)
2. Clique no botão **"☁️ Configurar Nuvem"**
3. Cole o token GitHub
4. Pronto! Botão muda para **"🌐 Nuvem Ativa"**

### 3️⃣ **Testar Sincronização**

1. **Dispositivo A**: Adicione um lançamento
   - Deve aparecer: "🌐 Sincronizado na nuvem!"
2. **Dispositivo B**: Abra o app
   - Dados aparecem automaticamente!

## ✅ **Como Funciona**

**Automático:**
- ✅ Adicionar lançamento → Salva local + GitHub
- ✅ Editar/excluir → Sincroniza automaticamente  
- ✅ Abrir app → Carrega da nuvem primeiro
- ✅ Sem internet → Usa dados locais

**Manual (se preferir):**
- 💾 "Backup Manual" → Baixa arquivo .json
- 📁 "Importar" → Carrega arquivo .json

## 🔧 **Gerenciar Configuração**

**Desabilitar sincronização:**
- Clique "🌐 Nuvem Ativa" → Confirmar desabilitação

**Reconfigurar:**
- Clique "☁️ Configurar Nuvem" → Cole novo token

## 🔒 **Segurança**

- ✅ **Dados privados** - Gist é privado
- ✅ **Token seguro** - Fica só no seu navegador
- ✅ **Sem acesso** - Ninguém mais vê seus dados
- ✅ **Gratuito** - GitHub Gist é 100% grátis

## ❓ **Problemas Comuns**

**"Erro na sincronização":**
- Verifique se o token ainda é válido
- Reconfigure com novo token

**"Dados não aparecem":**
- Aguarde alguns segundos
- Recarregue a página

**"Token inválido":**
- Gere novo token no GitHub
- Configure novamente no app