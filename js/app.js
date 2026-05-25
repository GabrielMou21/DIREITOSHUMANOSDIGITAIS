// Orquestrador Principal do Aplicativo (Roteamento, Eventos e Tema)
const App = {
  currentScreen: 'screen-home',
  theme: 'dark',
  init() {
    this.registerServiceWorker();
    this.setupTheme();
    this.setupNavigation();
    this.setupSimulatorControls();
    // Inicializar subsistemas
    QuizManager.init();
    SurveyManager.init();
    ReportManager.init();
    DashboardManager.init();
    // Exibe tela inicial
    this.navigateTo(this.currentScreen);
  },
  // Registro de Service Worker para suporte PWA offline
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
          .then((reg) => console.log('Service Worker registrado com sucesso!', reg.scope))
          .catch((err) => console.log('Falha ao registrar Service Worker:', err));
      });
    }
  },
  // Gerenciamento de Temas (Claro/Escuro)
  setupTheme() {
    const savedTheme = localStorage.getItem('dh_theme') || 'dark';
    this.theme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeButton();
  },
  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.theme);
    localStorage.setItem('dh_theme', this.theme);
    this.updateThemeButton();
    this.showToast(`Modo ${this.theme === 'dark' ? 'Escuro' : 'Claro'} ativado!`, 'sun');
  },
  updateThemeButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) {
      btn.innerHTML = this.theme === 'dark' ?
        `<svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>` :
        `<svg style="width:20px; height:20px;" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;
    }
  },
  // Roteador de Telas (Single Page Application - SPA)
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetScreen = item.getAttribute('data-target');
        if (targetScreen) {
          this.navigateTo(targetScreen);
        }
      });
    });
  },
  navigateTo(screenId) {
    this.currentScreen = screenId;
    // Desativar todas as telas e ativar a selecionada
    const screens = document.querySelectorAll('.app-screen');
    screens.forEach(scr => {
      scr.classList.remove('active');
    });
    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
      activeScreen.classList.add('active');
    }
    // Atualizar navegação inferior (Tabs)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-target') === screenId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    // Atualizar Título do Cabeçalho dependendo da aba
    const headerTitle = document.getElementById('header-main-title');
    if (headerTitle) {
      headerTitle.innerHTML = this.getScreenTitleText(screenId);
    }
    // Rolar para o topo do conteúdo da tela
    const contentArea = document.querySelector('.app-content');
    if (contentArea) contentArea.scrollTop = 0;
  },
  getScreenTitleText(screenId) {
    const logoSVG = `<svg style="width:20px; height:20px; stroke:var(--primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a9 9 0 001.813 5.312m14.045-.007a9.014 9.014 0 001.813-5.312V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v4a13.91 13.91 0 00-3.054 6.97M12 11V7a2 2 0 00-2-2H8M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`;
    switch (screenId) {
      case 'screen-home': return `${logoSVG} DHDigital`;
      case 'screen-quiz': return `Quiz Direitos`;
      case 'screen-survey': return `Pesquisa Acadêmica`;
      case 'screen-reports': return `Canal de Denúncias`;
      case 'screen-dashboard': return `Análise de Dados`;
      case 'screen-ods': return `ODS 16 & Cidadania`;
      default: return `DHDigital`;
    }
  },
  // Controles do Simulador de Smartphone (Desktop Only)
  setupSimulatorControls() {
    const frame = document.getElementById('device-frame-el');
    const btnIos = document.getElementById('sim-btn-ios');
    const btnAndroid = document.getElementById('sim-btn-android');
    if (!frame || !btnIos || !btnAndroid) return;
    btnIos.addEventListener('click', () => {
      frame.classList.remove('android');
      btnIos.classList.add('active');
      btnAndroid.classList.remove('active');
      this.showToast('Simulando visual iOS', 'smartphone');
    });
    btnAndroid.addEventListener('click', () => {
      frame.classList.add('android');
      btnAndroid.classList.add('active');
      btnIos.classList.remove('active');
      this.showToast('Simulando visual Android', 'smartphone');
    });
  },
  // Modais Educativos
  openEducationalModal(topic) {
    const overlay = document.getElementById('educational-modal-overlay');
    const body = document.getElementById('educational-modal-body');
    const title = document.getElementById('educational-modal-title');
    if (!overlay || !body || !title) return;
    const data = this.getEducationalContent(topic);
    title.textContent = data.title;
    body.innerHTML = data.html;
    overlay.classList.add('active');
  },
  closeEducationalModal() {
    const overlay = document.getElementById('educational-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  },
  getEducationalContent(topic) {
    switch (topic) {
      case 'privacy':
        return {
          title: "Privacidade e Proteção de Dados",
          html: `
            <p>A privacidade no ambiente digital é o direito de controlar a coleta, armazenamento e uso de seus dados pessoais. Com a expansão de algoritmos de rastreamento, nossa pegada digital (cookies, buscas, geolocalização) virou um produto de valor comercial.</p>
            <h4>O que diz a Legislação?</h4>
            <p>No Brasil, a <strong>LGPD (Lei Geral de Proteção de Dados - Lei 13.709/18)</strong> garante que o titular dos dados deve consentir de forma livre, inequívoca e informada sobre o uso de suas informações. Na Europa, a <strong>GDPR</strong> estipula multas severas para o descumprimento.</p>
            <span class="badge-law">LGPD: Artigo 7º (Bases legais de consentimento)</span>
            <h4>Consciência Crítica:</h4>
            <ul>
              <li>Sempre verifique as permissões de aplicativos no celular (acesso a contatos, câmera, fotos e microfone).</li>
              <li>A privacidade é um direito humano fundamental (previsto na Declaração Universal de 1948 e no Artigo 5º da nossa Constituição).</li>
            </ul>
          `
        };
      case 'expression':
        return {
          title: "Liberdade de Expressão Digital",
          html: `
            <p>A internet amplificou as vozes dos cidadãos, democratizando o acesso à informação e à livre manifestação do pensamento. Contudo, há um debate crítico entre expressar ideias e cometer ilícitos virtuais.</p>
            <h4>O que diz a Legislação?</h4>
            <p>O <strong>Marco Civil da Internet (Lei 12.965/14)</strong> protege a liberdade de expressão como pilar da rede brasileira. No entanto, a manifestação do pensamento tem limites claros. Injúria, difamação, calúnia, racismo e apologia ao crime são infrações tipificadas no Código Penal.</p>
            <span class="badge-law">Marco Civil: Artigo 19 (Garantia de não-censura prévia)</span>
            <h4>Consciência Crítica:</h4>
            <ul>
              <li>A liberdade de expressão não confere imunidade para o anonimato nocivo ou a desinformação deliberada (Fake News).</li>
              <li>Plataformas digitais não devem ser juízes de censura prévia, mas têm dever de remover conteúdos criminosos sob ordem judicial ou nos limites do consentimento (nudez privada).</li>
            </ul>
          `
        };
      case 'inclusion':
        return {
          title: "Inclusão Digital e Letramento",
          html: `
            <p>A inclusão digital não significa apenas o acesso físico a computadores ou conexões de internet (infraestrutura). Ela envolve, fundamentalmente, o <strong>letramento digital</strong>: a capacidade crítica de discernir informações na rede, utilizar serviços essenciais e exercer a cidadania ativa.</p>
            <h4>O que diz a Legislação?</h4>
            <p>O Marco Civil da Internet coloca o direito ao acesso à internet como essencial ao exercício da cidadania. O Estatuto da Pessoa com Deficiência exige acessibilidade total em páginas de órgãos governamentais e de interesse geral.</p>
            <span class="badge-law">Estatuto da PcD: Artigo 63 (Acessibilidade na Web)</span>
            <h4>Consciência Crítica:</h4>
            <ul>
              <li>A desigualdade digital gera exclusão econômica e social, limitando o acesso a empregos, educação e serviços governamentais essenciais.</li>
              <li>Sites e aplicativos devem possuir design universal e acessível (contraste, leitor de telas, legendas).</li>
            </ul>
          `
        };
      case 'hate_speech':
        return {
          title: "Combate ao Discurso de Ódio",
          html: `
            <p>O discurso de ódio online consiste na manifestação de preconceito, discriminação ou violência dirigida a minorias, ou grupos específicos com base em raça, gênero, orientação sexual, nacionalidade ou religião.</p>
            <h4>O que diz a Legislação?</h4>
            <p>A Constituição Federal brasileira declara em seu artigo 5º que racismo é crime inafiançável e imprescritível. O Código Penal tipifica o crime de injúria racial e homofobia (equiparada ao racismo pelo STF em 2019).</p>
            <span class="badge-law">Lei nº 7.716/1989 (Crimes de Preconceito Racial)</span>
            <h4>Consciência Crítica:</h4>
            <ul>
              <li>Denunciar discursos de ódio ajuda as plataformas a treinar algoritmos para filtrar agressões.</li>
              <li>A empatia e a ética digital são fundamentais para construir comunidades saudáveis online (Netiqueta).</li>
            </ul>
          `
        };
      default:
        return { title: "", html: "" };
    }
  },
  // Notificação Toast na Tela (Micro-animação)
  showToast(message, iconName = 'bell') {
    const toast = document.getElementById('global-toast');
    const toastText = document.getElementById('toast-text');
    const toastIcon = document.getElementById('toast-icon-container');
    if (!toast || !toastText || !toastIcon) return;
    toastText.textContent = message;
    toastIcon.innerHTML = this.getIconSvg(iconName);
    toast.classList.add('active');
    // Fechar automaticamente após 3 segundos
    setTimeout(() => {
      toast.classList.remove('active');
    }, 3000);
  },
  getIconSvg(name) {
    switch (name) {
      case 'check-circle':
        return `<svg style="width:18px; height:18px; stroke:var(--color-success);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
      case 'alert-triangle':
        return `<svg style="width:18px; height:18px; stroke:var(--color-danger);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
      case 'smartphone':
        return `<svg style="width:18px; height:18px; stroke:var(--primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>`;
      case 'sun':
        return `<svg style="width:18px; height:18px; stroke:var(--color-warning);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>`;
      default:
        return `<svg style="width:18px; height:18px; stroke:var(--primary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>`;
    }
  }
};
// Iniciar a aplicação
window.addEventListener('DOMContentLoaded', () => App.init());
