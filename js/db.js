// Gerenciamento de Banco de Dados Local (LocalStorage Wrapper)
const DB = {
  // Inicializa o banco de dados com dados de simulação (seed) caso esteja vazio
  init() {
    if (!localStorage.getItem('dh_reports')) {
      localStorage.setItem('dh_reports', JSON.stringify(this.getSeedReports()));
    }
    if (!localStorage.getItem('dh_surveys')) {
      localStorage.setItem('dh_surveys', JSON.stringify(this.getSeedSurveys()));
    }
    if (!localStorage.getItem('dh_quiz_score')) {
      localStorage.setItem('dh_quiz_score', JSON.stringify({ completed: false, score: 0 }));
    }
  },
  // Retorna todas as denúncias
  getReports() {
    return JSON.parse(localStorage.getItem('dh_reports')) || [];
  },
  // Salva uma nova denúncia
  saveReport(report) {
    const reports = this.getReports();
    reports.unshift(report); // Adiciona no início da lista
    localStorage.setItem('dh_reports', JSON.stringify(reports));
    // Dispara evento customizado para notificar o Dashboard
    window.dispatchEvent(new Event('db-update'));
    return reports;
  },
  // Atualiza o status de uma denúncia (Função Admin Simulada)
  updateReportStatus(id, newStatus, actionText) {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index].status = newStatus;
      reports[index].timeline.unshift({
        date: new Date().toLocaleDateString('pt-BR'),
        title: `Status alterado para: ${this.translateStatus(newStatus)}`,
        desc: actionText || 'Atualizado pela equipe de suporte digital.'
      });
      localStorage.setItem('dh_reports', JSON.stringify(reports));
      window.dispatchEvent(new Event('db-update'));
      return true;
    }
    return false;
  },
  // Retorna todas as respostas da pesquisa (anônimas)
  getSurveys() {
    return JSON.parse(localStorage.getItem('dh_surveys')) || [];
  },
  // Salva uma resposta da pesquisa
  saveSurvey(surveyData) {
    const surveys = this.getSurveys();
    surveys.push({
      id: 'survey_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      ...surveyData
    });
    localStorage.setItem('dh_surveys', JSON.stringify(surveys));
    window.dispatchEvent(new Event('db-update'));
    return surveys;
  },
  // Salva os pontos obtidos no Quiz
  saveQuizScore(score, total) {
    const quizResult = {
      completed: true,
      score: score,
      total: total,
      date: new Date().toLocaleDateString('pt-BR')
    };
    localStorage.setItem('dh_quiz_score', JSON.stringify(quizResult));
    return quizResult;
  },
  getQuizScore() {
    return JSON.parse(localStorage.getItem('dh_quiz_score')) || { completed: false, score: 0 };
  },
  // Tradução do Status
  translateStatus(status) {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'analyzing': return 'Em Análise';
      case 'resolved': return 'Concluído';
      default: return status;
    }
  },
  // Dados sementes (Seed) de denúncias
  getSeedReports() {
    return [
      {
        id: "rep_101",
        date: "12/05/2026",
        category: "hate_speech",
        categoryLabel: "Discurso de Ódio",
        description: "Comentários racistas e preconceituosos de forma sistemática em uma publicação pública de uma liderança comunitária local no Instagram.",
        status: "resolved",
        attachment: null,
        anonymous: true,
        timeline: [
          { date: "16/05/2026", title: "Denúncia Concluída", desc: "A SaferNet Brasil foi oficiada e o link da postagem foi denunciado diretamente na plataforma, resultando na remoção do conteúdo." },
          { date: "13/05/2026", title: "Análise Jurídica", desc: "Identificado enquadramento na Lei nº 7.716/1989 (Crimes de Preconceito de Raça ou de Cor)." },
          { date: "12/05/2026", title: "Registro Efetuado", desc: "Denúncia recebida pelo canal de triagem anônimo." }
        ]
      },
      {
        id: "rep_102",
        date: "15/05/2026",
        category: "privacy_breach",
        categoryLabel: "Invasão de Privacidade / LGPD",
        description: "Compartilhamento não autorizado de fotos e dados de contato telefônico em grupo de WhatsApp público sem consentimento prévio.",
        status: "analyzing",
        attachment: null,
        anonymous: false,
        contact: "gabriel.contato@email.com",
        timeline: [
          { date: "17/05/2026", title: "Encaminhado ao Suporte", desc: "Notificação extrajudicial em rascunho de acordo com as regras de remoção do Marco Civil da Internet (Artigo 19)." },
          { date: "15/05/2026", title: "Triagem Inicial", desc: "Caso classificado como violação do Art. 5º, X da CF/88 (Privacidade) e Art. 2º da LGPD." }
        ]
      },
      {
        id: "rep_103",
        date: "19/05/2026",
        category: "cyberbullying",
        categoryLabel: "Cyberbullying / Difamação",
        description: "Montagens depreciativas e mensagens ofensivas diárias direcionadas a um estudante em fórum acadêmico aberto.",
        status: "pending",
        attachment: null,
        anonymous: true,
        timeline: [
          { date: "19/05/2026", title: "Registro Efetuado", desc: "Triagem aguardando análise técnica da coordenação de direitos digitais." }
        ]
      },
      {
        id: "rep_104",
        date: "20/05/2026",
        category: "fake_news",
        categoryLabel: "Desinformação (Fake News)",
        description: "Campanha difamatória espalhando informações falsas sobre a vacinação infantil local em grupos de bairro no Telegram.",
        status: "pending",
        attachment: null,
        anonymous: true,
        timeline: [
          { date: "20/05/2026", title: "Registro Efetuado", desc: "Aguardando triagem de links de prova." }
        ]
      }
    ];
  },
  // Dados sementes (Seed) de respostas de questionários
  getSeedSurveys() {
    return [
      { id: "s1", age: "18-24", know_lgpd: "yes", experience_violation: "yes", type_violation: "cyberbullying", confidence_reporting: "medium" },
      { id: "s2", age: "25-34", know_lgpd: "yes", experience_violation: "no", type_violation: "none", confidence_reporting: "high" },
      { id: "s3", age: "18-24", know_lgpd: "no", experience_violation: "yes", type_violation: "hate_speech", confidence_reporting: "low" },
      { id: "s4", age: "35-44", know_lgpd: "yes", experience_violation: "yes", type_violation: "privacy_breach", confidence_reporting: "medium" },
      { id: "s5", age: "15-17", know_lgpd: "no", experience_violation: "yes", type_violation: "cyberbullying", confidence_reporting: "low" },
      { id: "s6", age: "45+", know_lgpd: "no", experience_violation: "no", type_violation: "none", confidence_reporting: "low" },
      { id: "s7", age: "25-34", know_lgpd: "yes", experience_violation: "yes", type_violation: "privacy_breach", confidence_reporting: "high" },
      { id: "s8", age: "18-24", know_lgpd: "yes", experience_violation: "yes", type_violation: "hate_speech", confidence_reporting: "medium" },
      { id: "s9", age: "25-34", know_lgpd: "no", experience_violation: "yes", type_violation: "fake_news", confidence_reporting: "low" },
      { id: "s10", age: "35-44", know_lgpd: "yes", experience_violation: "no", type_violation: "none", confidence_reporting: "high" },
      { id: "s11", age: "15-17", know_lgpd: "no", experience_violation: "yes", type_violation: "cyberbullying", confidence_reporting: "medium" },
      { id: "s12", age: "18-24", know_lgpd: "yes", experience_violation: "no", type_violation: "none", confidence_reporting: "medium" },
      { id: "s13", age: "45+", know_lgpd: "yes", experience_violation: "yes", type_violation: "privacy_breach", confidence_reporting: "medium" },
      { id: "s14", age: "25-34", know_lgpd: "yes", experience_violation: "yes", type_violation: "hate_speech", confidence_reporting: "high" },
      { id: "s15", age: "18-24", know_lgpd: "no", experience_violation: "yes", type_violation: "fake_news", confidence_reporting: "low" }
    ];
  }
};
// Inicializa automaticamente
DB.init();
