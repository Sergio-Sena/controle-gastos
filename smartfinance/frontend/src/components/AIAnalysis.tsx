import React, { useState, useEffect } from 'react';
import { aiAPI } from '../services/ai';

const AIAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalysis = async () => {
    console.log('🔍 Iniciando carregamento da análise IA...');
    setIsLoading(true);
    setError('');
    
    try {
      console.log('📡 Fazendo requisição para /api/ai/analyze');
      const data = await aiAPI.analyze();
      console.log('✅ Dados recebidos:', data);
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('❌ Erro completo:', err);
      console.error('❌ Response data:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      setError('Erro ao carregar análise');
    } finally {
      setIsLoading(false);
      console.log('🏁 Carregamento finalizado');
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>🤖 Analisando suas finanças...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <button onClick={loadAnalysis} style={{ padding: '5px 10px' }}>
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!analysis) {
    return <div style={{ padding: '20px' }}>Nenhuma análise disponível</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>🤖 Análise IA</h3>
        <button 
          onClick={loadAnalysis}
          style={{ padding: '5px 10px', cursor: 'pointer' }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Insights */}
      <div style={{ marginBottom: '20px' }}>
        <h4>💡 Insights</h4>
        {analysis.insights?.map((insight, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            margin: '5px 0', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '5px',
            borderLeft: '4px solid #2196f3'
          }}>
            {insight}
          </div>
        ))}
      </div>

      {/* Recomendações */}
      <div style={{ marginBottom: '20px' }}>
        <h4>🎯 Recomendações</h4>
        {analysis.recommendations?.map((rec, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            margin: '5px 0', 
            backgroundColor: '#e8f5e8', 
            borderRadius: '5px',
            borderLeft: '4px solid #4caf50'
          }}>
            {rec}
          </div>
        ))}
      </div>

      {/* Categorias */}
      {Object.keys(analysis.categories || {}).length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4>📊 Gastos por Categoria</h4>
          {Object.entries(analysis.categories).map(([category, amount]) => (
            <div key={category} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '8px 0',
              borderBottom: '1px solid #eee'
            }}>
              <span>{category}</span>
              <span style={{ fontWeight: 'bold' }}>
                R$ {amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Análise IA avançada (se disponível) */}
      {analysis.aiInsights && (
        <div style={{ marginTop: '20px' }}>
          <h4>🧠 Análise Avançada IA</h4>
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f5f5f5', 
            borderRadius: '8px',
            whiteSpace: 'pre-wrap'
          }}>
            {analysis.aiInsights}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;