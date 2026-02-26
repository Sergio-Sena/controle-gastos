import React from 'react';

const SimpleChart = ({ data, title }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div>Sem dados para exibir</div>;
  }

  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  const maxValue = Math.max(...Object.values(data));

  return (
    <div style={{ padding: '20px' }}>
      <h4>{title}</h4>
      <div style={{ marginTop: '15px' }}>
        {Object.entries(data).map(([category, amount]) => {
          const percentage = ((amount / total) * 100).toFixed(1);
          const barWidth = (amount / maxValue) * 100;
          
          return (
            <div key={category} style={{ marginBottom: '10px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '5px',
                fontSize: '14px'
              }}>
                <span>{category}</span>
                <span>R$ {amount.toFixed(2)} ({percentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${barWidth}%`, 
                  height: '100%', 
                  backgroundColor: '#007bff',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleChart;