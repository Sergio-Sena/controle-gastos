import React from 'react';
import { TrendingUp, Shield, Zap, BarChart3, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui';
import ThemeToggle from './ThemeToggle';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'clamp(1rem, 2vw, 1.5rem)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={28} style={{ color: 'var(--primary-500)' }} />
            <span className="gradient-text" style={{ fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 'bold' }}>
              SmartFinance
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <ThemeToggle />
            <Button variant="primary" size="md" onClick={onGetStarted}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: 'clamp(3rem, 10vw, 8rem) clamp(1rem, 3vw, 2rem)',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div className="animate-fadeIn" style={{
          display: 'inline-block',
          padding: '0.5rem 1rem',
          background: 'var(--primary-50)',
          borderRadius: 'var(--radius-full)',
          marginBottom: '2rem',
          border: '1px solid var(--primary-200)'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'var(--primary-700)' }}>
            <Sparkles size={16} />
            Controle Financeiro Inteligente
          </span>
        </div>

        <h1 className="gradient-text animate-slideUp" style={{
          fontSize: 'clamp(2.5rem, 8vw, 4rem)',
          fontWeight: 'bold',
          lineHeight: '1.1',
          marginBottom: '1.5rem'
        }}>
          Suas Finanças,<br />Sob Controle
        </h1>

        <p className="animate-slideUp" style={{
          fontSize: 'clamp(1.125rem, 3vw, 1.5rem)',
          color: 'var(--text-secondary)',
          maxWidth: '700px',
          margin: '0 auto 3rem',
          lineHeight: '1.6',
          animationDelay: '100ms'
        }}>
          Conecte seus bancos, analise gastos e receba insights automáticos com IA.
          Simples, seguro e poderoso.
        </p>

        <div className="animate-slideUp" style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animationDelay: '200ms'
        }}>
          <Button variant="primary" size="lg" onClick={onGetStarted} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Começar Grátis <ArrowRight size={20} />
          </Button>
          <Button variant="ghost" size="lg" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver Recursos
          </Button>
        </div>

        <p style={{ marginTop: '1.5rem', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
          ✨ Sem cartão de crédito • 🔒 100% Seguro • 🚀 Comece em 2 minutos
        </p>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 3vw, 2rem)',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
            <h2 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 'bold',
              marginBottom: '1rem'
            }}>
              Tudo que você precisa
            </h2>
            <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)' }}>
              Ferramentas poderosas para controle financeiro completo
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2rem)'
          }}>
            {[
              {
                icon: <BarChart3 size={32} />,
                title: 'Análise Inteligente',
                description: 'Visualize seus gastos por categoria com gráficos interativos e insights automáticos.'
              },
              {
                icon: <Shield size={32} />,
                title: 'Open Finance',
                description: 'Conecte seus bancos de forma segura e importe transações automaticamente.'
              },
              {
                icon: <Zap size={32} />,
                title: 'Alertas em Tempo Real',
                description: 'Receba notificações sobre gastos incomuns e oportunidades de economia.'
              },
              {
                icon: <Sparkles size={32} />,
                title: 'IA Financeira',
                description: 'Recomendações personalizadas baseadas em seus hábitos de consumo.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="stagger-item hover-lift"
                style={{
                  padding: 'clamp(1.5rem, 3vw, 2rem)',
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-xl)',
                  transition: 'all var(--transition-base)',
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'var(--gradient-primary)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  marginBottom: '1.5rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 3vw, 2rem)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1rem'
          }}>
            Planos para todos
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'var(--text-secondary)' }}>
            Comece grátis e evolua conforme sua necessidade
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: 'clamp(1.5rem, 3vw, 2rem)'
        }}>
          {[
            {
              name: 'Free',
              price: 'R$ 0',
              period: '/mês',
              description: 'Para começar',
              features: ['1 conta bancária', '7 dias de histórico', 'Gráficos básicos', 'Suporte por email'],
              cta: 'Começar Grátis',
              variant: 'ghost' as const
            },
            {
              name: 'Pro',
              price: 'R$ 49',
              period: '/mês',
              description: 'Mais popular',
              features: ['3 contas bancárias', '90 dias de histórico', 'Alertas inteligentes', 'Análise com IA', 'Suporte prioritário'],
              cta: 'Começar Teste Grátis',
              variant: 'primary' as const,
              popular: true
            },
            {
              name: 'Business',
              price: 'R$ 99',
              period: '/mês',
              description: 'Para empresas',
              features: ['10 contas bancárias', 'Histórico ilimitado', 'Relatórios PDF', 'Multi-usuário', 'Suporte dedicado'],
              cta: 'Falar com Vendas',
              variant: 'secondary' as const
            }
          ].map((plan, index) => (
            <div
              key={index}
              className="stagger-item hover-lift"
              style={{
                padding: 'clamp(1.5rem, 3vw, 2rem)',
                background: plan.popular ? 'var(--gradient-primary)' : 'var(--glass-bg)',
                backdropFilter: 'blur(20px)',
                border: plan.popular ? 'none' : '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-xl)',
                position: 'relative',
                color: plan.popular ? 'white' : 'inherit',
                animationDelay: `${index * 100}ms`
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--success-500)',
                  color: 'white',
                  padding: '0.25rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'bold'
                }}>
                  Mais Popular
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)', fontWeight: 'bold' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 'var(--text-lg)', opacity: 0.8 }}>
                  {plan.period}
                </span>
              </div>

              <ul style={{ marginBottom: '2rem', listStyle: 'none', padding: 0 }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <Check size={20} style={{ color: plan.popular ? 'white' : 'var(--success-500)', flexShrink: 0 }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.variant}
                size="lg"
                onClick={onGetStarted}
                style={{
                  width: '100%',
                  background: plan.popular ? 'white' : undefined,
                  color: plan.popular ? 'var(--primary-500)' : undefined
                }}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: 'clamp(3rem, 8vw, 6rem) clamp(1rem, 3vw, 2rem)',
        background: 'var(--gradient-primary)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 'bold',
            marginBottom: '1.5rem'
          }}>
            Pronto para transformar suas finanças?
          </h2>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', marginBottom: '2rem', opacity: 0.95 }}>
            Junte-se a milhares de usuários que já estão no controle do seu dinheiro
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={onGetStarted}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Começar Agora <ArrowRight size={20} />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: 'clamp(2rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)',
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-primary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={24} style={{ color: 'var(--primary-500)' }} />
            <span className="gradient-text" style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>
              SmartFinance
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            © 2024 SmartFinance by SS Technologies. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
