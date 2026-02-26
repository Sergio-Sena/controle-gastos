const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (error) {
  console.log('Google Gemini não configurado, usando análise básica');
}

class AIService {
  async analyzeTransactions(transactions) {
    try {
      if (!transactions || transactions.length === 0) {
        return {
          insights: ['Adicione transações para análises personalizadas'],
          categories: {},
          recommendations: ['Comece registrando receitas e despesas']
        };
      }

      const analysis = this.basicAnalysis(transactions);
      
      if (genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'demo-key') {
        return await this.geminiAnalysis(transactions, analysis);
      }

      return analysis;
    } catch (error) {
      console.error('Erro na análise IA:', error);
      return this.basicAnalysis(transactions);
    }
  }

  basicAnalysis(transactions) {
    const receitas = transactions.filter(t => t.type === 'receita');
    const despesas = transactions.filter(t => t.type === 'despesa');
    
    const totalReceitas = receitas.reduce((sum, t) => sum + t.amount, 0);
    const totalDespesas = despesas.reduce((sum, t) => sum + t.amount, 0);
    const saldo = totalReceitas - totalDespesas;

    const categories = {};
    despesas.forEach(t => {
      const category = this.categorizeTransaction(t.description);
      categories[category] = (categories[category] || 0) + t.amount;
    });

    const insights = [];
    const recommendations = [];

    if (saldo < 0) {
      insights.push(`Gastando R$ ${Math.abs(saldo).toFixed(2)} a mais que a renda`);
      recommendations.push('Revise gastos e identifique onde economizar');
    } else {
      insights.push(`Saldo positivo de R$ ${saldo.toFixed(2)}`);
      recommendations.push('Continue mantendo controle dos gastos');
    }

    if (totalDespesas > 0) {
      const maiorCategoria = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      if (maiorCategoria) {
        insights.push(`Maior gasto: ${maiorCategoria[0]} (R$ ${maiorCategoria[1].toFixed(2)})`);
      }
    }

    return { insights, categories, recommendations };
  }

  async geminiAnalysis(transactions, basicAnalysis) {
    try {
      if (!genAI) {
        return basicAnalysis;
      }
      
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Analise estas transações financeiras:
        ${JSON.stringify(transactions.slice(0, 20))}
        
        Forneça 3 insights e 3 recomendações práticas em português.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        ...basicAnalysis,
        aiInsights: text,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro Gemini:', error);
      return basicAnalysis;
    }
  }

  categorizeTransaction(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('mercado') || desc.includes('alimentação')) return 'Alimentação';
    if (desc.includes('combustível') || desc.includes('uber')) return 'Transporte';
    if (desc.includes('aluguel') || desc.includes('casa')) return 'Moradia';
    if (desc.includes('médico') || desc.includes('saúde')) return 'Saúde';
    if (desc.includes('cinema') || desc.includes('lazer')) return 'Lazer';
    
    return 'Outros';
  }
}

module.exports = new AIService();