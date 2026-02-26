import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartData {
  labels: string[];
  values: number[];
}

interface FinanceChartProps {
  data: ChartData;
  type?: 'bar' | 'pie';
  title: string;
}

const FinanceChart: React.FC<FinanceChartProps> = ({ data, type = 'bar', title }) => {
  const [theme, setTheme] = React.useState(document.documentElement.getAttribute('data-theme') || 'light');
  
  // Observar mudanças de tema
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute('data-theme') || 'light');
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);
  
  const isDark = theme === 'dark';
  const textColor = isDark ? '#f8fafc' : '#1e293b';
  
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Valor (R$)',
        data: data.values,
        backgroundColor: [
          'rgba(6, 182, 212, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(6, 182, 212)',
          'rgb(16, 185, 129)',
          'rgb(236, 72, 153)',
          'rgb(245, 158, 11)',
          'rgb(99, 102, 241)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === 'pie',
        position: 'bottom' as const,
        labels: {
          color: textColor,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `R$ ${context.parsed.y?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || context.parsed.toFixed(2)}`;
          }
        }
      }
    },
    scales: type === 'bar' ? {
      y: {
        beginAtZero: true,
        ticks: {
          color: textColor,
          callback: function(value: any) {
            return 'R$ ' + value.toLocaleString('pt-BR');
          }
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        ticks: {
          color: textColor
        },
        grid: {
          display: false
        }
      }
    } : undefined
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      {type === 'bar' ? (
        <Bar data={chartData} options={options} />
      ) : (
        <Pie data={chartData} options={options} />
      )}
    </div>
  );
};

export default FinanceChart;
