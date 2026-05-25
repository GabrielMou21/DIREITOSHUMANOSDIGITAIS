// Banco de Questões do Quiz de Conscientização Crítica
const QUIZ_QUESTIONS = [
  {
    id: 1,
    scenario: "Um perfil em uma rede social publica fotos íntimas de uma pessoa sem o consentimento dela, sob a alegação de 'liberdade de expressão'. De acordo com a legislação brasileira, qual é a conduta correta a ser adotada?",
    options: [
      { text: "A publicação é protegida pela liberdade de expressão, por isso nada pode ser feito legalmente.", isCorrect: false },
      { text: "De acordo com o Marco Civil da Internet (Art. 21), a postagem deve ser removida imediatamente após notificação da vítima, sob responsabilidade subsidiária do site.", isCorrect: true },
      { text: "A vítima deve aguardar uma ordem judicial expressa antes de solicitar a exclusão da foto na plataforma.", isCorrect: false },
      { text: "A LGPD impede qualquer ação de exclusão, pois se trata de dados pessoais compartilhados em ambiente privado.", isCorrect: false }
    ],
    explanation: "O Artigo 21 do Marco Civil da Internet estabelece uma exceção importante: o provedor que disponibilizar conteúdo gerado por terceiros contendo cenas de nudez ou de atos sexuais de caráter privado será responsabilizado civilmente por danos caso não promova a exclusão após notificação direta da vítima."
  },
  {
    id: 2,
    scenario: "Uma empresa de aplicativos coleta seu histórico de localização e contatos telefônicos em segundo plano, sem explicar claramente para qual finalidade fará o uso dessas informações. Qual princípio da LGPD está sendo violado?",
    options: [
      { text: "O princípio do livre acesso apenas.", isCorrect: false },
      { text: "Os princípios da finalidade, necessidade e transparência, pois o titular tem direito a informações claras sobre o tratamento de seus dados.", isCorrect: true },
      { text: "Nenhum princípio, já que ao baixar o aplicativo você aceitou implicitamente a coleta total de dados.", isCorrect: false },
      { text: "Apenas o princípio da segurança contra ataques hackers externos.", isCorrect: false }
    ],
    explanation: "Segundo a LGPD (Lei Geral de Proteção de Dados), o tratamento de dados pessoais deve seguir propósitos legítimos, específicos e explícitos (Finalidade), limitar-se ao mínimo necessário para o cumprimento das metas (Necessidade) e garantir informações claras sobre a coleta (Transparência)."
  },
  {
    id: 3,
    scenario: "Em um fórum escolar online, um grupo de estudantes publica posts diários depreciativos e ameaças veladas contra um colega de classe em razão de sua orientação sexual. Como essa situação é enquadrada ética e legalmente?",
    options: [
      { text: "É classificada apenas como indisciplina escolar, sem implicações legais ou jurídicas fora da escola.", isCorrect: false },
      { text: "Caracteriza cyberbullying e discurso de ódio. Legalmente, pode ser enquadrado como injúria/difamação e preconceito/discriminação (Lei 7.716/89).", isCorrect: true },
      { text: "Trata-se de uma opinião pessoal protegida pelo direito constitucional à manifestação do pensamento.", isCorrect: false },
      { text: "Por ser anônimo em ambiente virtual, não há responsabilização civil aplicável aos envolvidos.", isCorrect: false }
    ],
    explanation: "O discurso de ódio contra grupos vulneráveis e o cyberbullying extrapolam a liberdade de expressão. O Código Penal (crimes contra a honra) e a Lei de Racismo (Lei 7.716/89) aplicam-se plenamente ao ambiente virtual, permitindo que a autoria seja rastreada via endereço de IP."
  },
  {
    id: 4,
    scenario: "Você recebe um link em um grupo de mensagens com uma notícia alarmante sobre o fechamento de postos de saúde locais devido a uma suposta contaminação. O link não é de um portal de notícias conhecido e pede para repassar imediatamente. Qual ação alinha-se ao pensamento computacional e à cidadania digital?",
    options: [
      { text: "Compartilhar com outros grupos rapidamente, pois a saúde pública é importante e é melhor prevenir.", isCorrect: false },
      { text: "Ignorar e excluir o link de imediato, sem investigar a origem ou denunciar.", isCorrect: false },
      { text: "Aplicar a decomposição e análise crítica: checar a fonte oficial do município, procurar em portais de notícias e evitar repassar boatos sem validação.", isCorrect: true },
      { text: "Repassar apenas para amigos próximos, pedindo que eles também verifiquem.", isCorrect: false }
    ],
    explanation: "Combater a desinformação envolve o pensamento computacional através do reconhecimento de padrões e avaliação de dados. O compartilhamento irresponsável atenta contra o ODS 16, gerando pânico social e fragilizando instituições democráticas e de saúde."
  },
  {
    id: 5,
    scenario: "Um site público de serviços municipais não possui suporte para leitores de tela ou ajuste de contraste para pessoas com deficiência visual. Que direito fundamental digital está em debate?",
    options: [
      { text: "Apenas o direito à privacidade dos dados cadastrados.", isCorrect: false },
      { text: "O direito à liberdade de cátedra dos desenvolvedores do site.", isCorrect: false },
      { text: "A inclusão digital e a acessibilidade digital, garantidas pelo Estatuto da Pessoa com Deficiência e pelo Marco Civil da Internet.", isCorrect: true },
      { text: "A propriedade intelectual do código fonte do sistema público.", isCorrect: false }
    ],
    explanation: "A acessibilidade é um pilar da inclusão digital. O Marco Civil da Internet estabelece que a acessibilidade deve ser assegurada na administração pública como direito de participação cidadã digital."
  }
];
// Gerenciador do Quiz
const QuizManager = {
  currentQuestionIndex: 0,
  score: 0,
  selectedOptionIndex: null,
  init() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.selectedOptionIndex = null;
    this.renderQuestion();
  },
  renderQuestion() {
    const container = document.getElementById('quiz-question-container');
    if (!container) return;
    // Atualizar progresso
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressPercent = ((this.currentQuestionIndex) / QUIZ_QUESTIONS.length) * 100;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (this.currentQuestionIndex >= QUIZ_QUESTIONS.length) {
      this.showResult();
      return;
    }
    const question = QUIZ_QUESTIONS[this.currentQuestionIndex];
    this.selectedOptionIndex = null;
    let optionsHTML = '';
    question.options.forEach((opt, idx) => {
      optionsHTML += `
        <button class="quiz-option-btn" onclick="QuizManager.selectOption(${idx})" id="opt-${idx}">
          ${opt.text}
        </button>
      `;
    });
    container.innerHTML = `
      <div style="margin-bottom: 16px; font-weight: 700; color: var(--primary); font-size: 14px;">
        Questão ${this.currentQuestionIndex + 1} de ${QUIZ_QUESTIONS.length}
      </div>
      <p style="font-size: 15px; font-weight: 500; line-height: 1.5; margin-bottom: 20px;">
        ${question.scenario}
      </p>
      <div style="margin-bottom: 20px;">
        ${optionsHTML}
      </div>
      <div id="quiz-explanation-box" class="glass-card card-primary" style="display: none; font-size: 13px; line-height: 1.5; padding: 14px; margin-bottom: 20px;">
        <strong>Orientação Legal:</strong> <span id="quiz-explanation-text"></span>
      </div>
      <button id="quiz-action-btn" class="btn-primary" onclick="QuizManager.checkAnswer()" disabled>
        Verificar Resposta
      </button>
    `;
  },
  selectOption(index) {
    // Se a explicação já estiver ativa, não permitir re-selecionar
    const explanationBox = document.getElementById('quiz-explanation-box');
    if (explanationBox && explanationBox.style.display === 'block') return;
    this.selectedOptionIndex = index;
    // Desmarcar anteriores
    const buttons = document.querySelectorAll('.quiz-option-btn');
    buttons.forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
    // Habilitar botão de ação
    const actionBtn = document.getElementById('quiz-action-btn');
    if (actionBtn) actionBtn.removeAttribute('disabled');
  },
  checkAnswer() {
    const actionBtn = document.getElementById('quiz-action-btn');
    if (!actionBtn) return;
    const question = QUIZ_QUESTIONS[this.currentQuestionIndex];
    if (actionBtn.textContent === 'Próxima Questão') {
      this.currentQuestionIndex++;
      this.renderQuestion();
      return;
    }
    const isCorrect = question.options[this.selectedOptionIndex].isCorrect;
    // Aplicar estilos visuais de resposta
    question.options.forEach((opt, idx) => {
      const btn = document.getElementById(`opt-${idx}`);
      if (btn) {
        btn.classList.remove('selected');
        if (opt.isCorrect) {
          btn.classList.add('correct');
        } else if (idx === this.selectedOptionIndex) {
          btn.classList.add('incorrect');
        }
      }
    });
    if (isCorrect) {
      this.score++;
      App.showToast('Resposta correta!', 'check-circle');
    } else {
      App.showToast('Resposta incorreta. Veja a fundamentação legal.', 'alert-triangle');
    }
    // Exibir fundamentação
    const explanationBox = document.getElementById('quiz-explanation-box');
    const explanationText = document.getElementById('quiz-explanation-text');
    if (explanationBox && explanationText) {
      explanationText.textContent = question.explanation;
      explanationBox.style.display = 'block';
    }
    // Mudar ação do botão
    actionBtn.textContent = 'Próxima Questão';
  },
  showResult() {
    const container = document.getElementById('quiz-question-container');
    if (!container) return;
    // Atualizar barra de progresso para 100%
    const progressFill = document.getElementById('quiz-progress-fill');
    if (progressFill) progressFill.style.width = '100%';
    // Salvar no BD Local
    DB.saveQuizScore(this.score, QUIZ_QUESTIONS.length);
    let message = '';
    let emoji = '🎓';
    if (this.score === QUIZ_QUESTIONS.length) {
      message = "Excelente! Você demonstrou pleno domínio dos seus Direitos Humanos Digitais e das leis brasileiras.";
      emoji = '🏆';
    } else if (this.score >= 3) {
      message = "Muito bom! Você possui uma consciência crítica bem formada, mas ainda há alguns pontos de legislação digital para revisar.";
      emoji = '🌟';
    } else {
      message = "Bom começo! Que tal ler mais nosso Guia de Direitos Digitais e tentar o quiz novamente para fixar os conceitos?";
      emoji = '📚';
    }
    container.innerHTML = `
      <div style="text-align: center; padding: 20px 0;">
        <span style="font-size: 64px;">${emoji}</span>
        <h3 class="screen-title" style="margin-top: 16px; font-size: 22px;">Quiz Concluído!</h3>
        <p style="font-size: 32px; font-weight: 800; color: var(--primary); margin: 12px 0;">
          ${this.score} / ${QUIZ_QUESTIONS.length}
        </p>
        <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 24px;">
          ${message}
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button class="btn-primary" onclick="QuizManager.init()">
            Refazer Quiz
          </button>
          <button class="btn-outline" onclick="App.navigateTo('screen-home')">
            Voltar para o Início
          </button>
        </div>
      </div>
    `;
  }
};
