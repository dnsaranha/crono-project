import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const handleLoginClick = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div>
      <header>
        <nav className="navbar">
          <div className="container">
            <div className="logo">
              <img src="/src/assets/logo-cronoproject.png" alt="CronoProject Logo" className="logo-img" />
              <span>CronoProject</span>
            </div>
            <ul className="nav-links">
              <li><a href="#recursos">Recursos</a></li>
              <li><a href="#planos">Planos</a></li>
              <li><a href="#contato">Contato</a></li>
              <li><button onClick={handleLoginClick} className="btn btn-outline">Entrar</button></li>
              <li><Link to="/signup" className="btn btn-primary">Cadastrar</Link></li>
            </ul>
            <div className="hamburger">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Gerencie seus cronogramas com eficiência</h1>
            <p>Planejamento, WBS e gráficos de Gantt integrados em uma plataforma intuitiva</p>
            <div className="hero-buttons">
              <Link to="/signup" className="btn btn-primary btn-lg">Comece Grátis</Link>
              <a href="#demo" className="btn btn-outline btn-lg">Ver Demo</a>
            </div>
          </div>
          <div className="hero-image">
            <img src="/src/assets/cronoproject-dashboard.png" alt="Dashboard CronoProject" />
          </div>
        </div>
      </section>

      <section id="exemplos" className="examples">
        <div className="container">
          <h2 className="section-title">Exemplos de Uso</h2>
          <p className="section-subtitle">Veja como o CronoProject transforma o gerenciamento de projetos</p>
          
          <div className="examples-slider">
            <div className="slider-container">
              <div className="slider-item">
                <img src="/src/assets/exemplo-gantt.png" alt="Exemplo de Gráfico de Gantt" />
                <div className="slider-caption">
                  <h3>Gráfico de Gantt</h3>
                  <p>Visualize o cronograma completo com dependências e caminho crítico</p>
                </div>
              </div>
              <div className="slider-item">
                <img src="/src/assets/exemplo-wbs.png" alt="Exemplo de WBS" />
                <div className="slider-caption">
                  <h3>Estrutura Analítica do Projeto (WBS)</h3>
                  <p>Organize as entregas e pacotes de trabalho hierarquicamente</p>
                </div>
              </div>
              <div className="slider-item">
                <img src="/src/assets/exemplo-dashboard.png" alt="Exemplo de Dashboard" />
                <div className="slider-caption">
                  <h3>Dashboard de Projetos</h3>
                  <p>Acompanhe o progresso de todos os seus projetos em um só lugar</p>
                </div>
              </div>
            </div>
            <div className="slider-controls">
              <button className="slider-prev"><i className="fas fa-chevron-left"></i></button>
              <div className="slider-dots">
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <button className="slider-next"><i className="fas fa-chevron-right"></i></button>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <div className="footer-logo">
                <img src="/src/assets/logo-cronoproject-white.png" alt="CronoProject Logo" className="logo-img-small" />
                <span>CronoProject</span>
              </div>
              <p>Solução completa para gerenciamento de cronogramas de projetos.</p>
            </div>
            <div className="footer-col">
              <h4>Produto</h4>
              <ul>
                <li><a href="#recursos">Recursos</a></li>
                <li><a href="#planos">Planos e Preços</a></li>
                <li><a href="/roadmap">Roadmap</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Empresa</h4>
              <ul>
                <li><a href="/sobre">Sobre nós</a></li>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/cases">Casos de Sucesso</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Suporte</h4>
              <ul>
                <li><a href="/ajuda">Central de Ajuda</a></li>
                <li><a href="/contato">Contato</a></li>
                <li><a href="/status">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 CronoProject. Todos os direitos reservados.</p>
            <div className="footer-links">
              <a href="/termos">Termos de Uso</a>
              <a href="/privacidade">Política de Privacidade</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;