// Gerenciador do Dashboard Dinâmico em SVG (Visualização Científica de Dados)
const DashboardManager = {
  init() {
    window.addEventListener('db-update', () => this.renderDashboard());
    this.renderDashboard();
  },
  renderDashboard() {
    const reports = DB.getReports();
    const surveys = DB.getSurveys();
    // 1. Atualizar KPIs Numéricos
    const totalReports = reports.length;
    const totalSurveys = surveys.length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const knowLgpdCount = surveys.filter(s => s.know_lgpd === 'yes').length;
    const knowledgeRate = totalSurveys > 0 ? Math.round((knowLgpdCount / totalSurveys) * 100) : 0;
    const elTotalReports = document.getElementById('kpi-total-reports');
    const elTotalSurveys = document.getElementById('kpi-total-surveys');
    const elResolvedReports = document.getElementById('kpi-resolved-reports');
    const elKnowledgeRate = document.getElementById('kpi-knowledge-rate');
    if (elTotalReports) elTotalReports.textContent = totalReports;
    if (elTotalSurveys) elTotalSurveys.textContent = totalSurveys;
    if (elResolvedReports) elResolvedReports.textContent = resolvedReports;
    if (elKnowledgeRate) elKnowledgeRate.textContent = `${knowledgeRate}%`;
    // 2. Renderizar Gráficos SVG
    this.drawViolationsDonut(reports);
    this.drawAgeBarChart(surveys);
    this.renderConfidenceIndicators(surveys);
  },
  // Desenha um gráfico de rosca (Donut Chart) 100% SVG nativo
  drawViolationsDonut(reports) {
    const container = document.getElementById('violations-chart-container');
    if (!container) return;
    const counts = { hate_speech: 0, privacy_breach: 0, cyberbullying: 0, fake_news: 0 };
    reports.forEach(r => {
      if (counts[r.category] !== undefined) counts[r.category]++;
    });
    const categories = [
      { key: 'hate_speech', label: 'Discurso de Ódio', color: '#8b5cf6', val: counts.hate_speech },
      { key: 'privacy_breach', label: 'Invasão Privacidade', color: '#10b981', val: counts.privacy_breach },
      { key: 'cyberbullying', label: 'Cyberbullying', color: '#f59e0b', val: counts.cyberbullying },
      { key: 'fake_news', label: 'Desinformação', color: '#ef4444', val: counts.fake_news }
    ];
    const total = categories.reduce((sum, c) => sum + c.val, 0);
    if (total === 0) {
      container.innerHTML = `
        <div style="font-size:12px; color:var(--text-muted); text-align:center; padding-top:80px;">
          Sem denúncias suficientes no dispositivo para desenhar o gráfico.
        </div>
      `;
      return;
    }
    const size = 180;
    const center = size / 2;
    const radius = 60;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;
    let svgContent = `<svg class="chart-svg" viewBox="0 0 ${size} ${size}">`;
    let accumulatedOffset = 0;
    categories.forEach(cat => {
      if (cat.val === 0) return;
      const percentage = cat.val / total;
      const strokeLength = percentage * circumference;
      const strokeOffset = circumference - strokeLength + accumulatedOffset;
      svgContent += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="transparent"
          stroke="${cat.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeOffset}"
          transform="rotate(-90 ${center} ${center})"
          style="transition: stroke-dashoffset 0.8s ease-in-out;"
        />
      `;
      accumulatedOffset -= strokeLength;
    });
    svgContent += `
      <circle cx="${center}" cy="${center}" r="${radius - strokeWidth/2}" fill="var(--surface-color)" />
      <text x="${center}" y="${center + 4}" text-anchor="middle" font-family="var(--font-heading)" font-size="12" font-weight="700" fill="var(--text-color)">
        Total: ${total}
      </text>
      </svg>
    `;
    let legendHTML = '<div class="chart-legend">';
    categories.forEach(cat => {
      const pct = total > 0 ? Math.round((cat.val / total) * 100) : 0;
      legendHTML += `
        <div class="legend-item">
          <span class="legend-dot" style="background:${cat.color}"></span>
          <span>${cat.label} (${pct}%)</span>
        </div>
      `;
    });
    legendHTML += '</div>';
    container.innerHTML = svgContent + legendHTML;
  },
  // Desenha um gráfico de barras vertical em SVG nativo
  drawAgeBarChart(surveys) {
    const container = document.getElementById('age-chart-container');
    if (!container) return;
    const counts = { '15-17': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 };
    surveys.forEach(s => {
      if (counts[s.age] !== undefined) counts[s.age]++;
    });
    const data = [
      { label: '15-17', val: counts['15-17'], color: '#3b82f6' },
      { label: '18-24', val: counts['18-24'], color: '#8b5cf6' },
      { label: '25-34', val: counts['25-34'], color: '#10b981' },
      { label: '35-44', val: counts['35-44'], color: '#f59e0b' },
      { label: '45+', val: counts['45+'], color: '#ef4444' }
    ];
    const maxVal = Math.max(...data.map(d => d.val), 1);
    const width = 300;
    const height = 150;
    const barPadding = 12;
    const chartHeight = height - 30;
    const barWidth = (width / data.length) - barPadding;
    let svgContent = `<svg class="chart-svg" viewBox="0 0 ${width} ${height}">`;
    for (let i = 0; i <= 3; i++) {
      const y = 10 + (chartHeight / 3) * i;
      svgContent += `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="var(--border-color)" stroke-width="0.5" stroke-dasharray="3" />`;
    }
    data.forEach((item, idx) => {
      const barHeight = (item.val / maxVal) * chartHeight;
      const x = idx * (barWidth + barPadding) + barPadding/2;
      const y = chartHeight - barHeight + 10;
      svgContent += `
        <rect
          x="${x}"
          y="${y}"
          width="${barWidth}"
          height="${barHeight}"
          rx="4"
          fill="${item.color}"
          style="transition: height 0.6s ease, y 0.6s ease;"
        />
        <text x="${x + barWidth/2}" y="${y - 4}" text-anchor="middle" font-family="var(--font-body)" font-size="10" font-weight="700" fill="var(--text-color)">
          ${item.val}
        </text>
        <text x="${x + barWidth/2}" y="${chartHeight + 22}" text-anchor="middle" font-family="var(--font-body)" font-size="9" fill="var(--text-secondary)">
          ${item.label}
        </text>
      `;
    });
    svgContent += `</svg>`;
    container.innerHTML = svgContent;
  },
  // Renderiza barras horizontais baseadas em HTML/CSS para confiança de denúncia
  renderConfidenceIndicators(surveys) {
    const container = document.getElementById('confidence-chart-container');
    if (!container) return;
    const counts = { high: 0, medium: 0, low: 0 };
    surveys.forEach(s => {
      if (counts[s.confidence_reporting] !== undefined) counts[s.confidence_reporting]++;
    });
    const total = surveys.length;
    const levels = [
      { key: 'high', label: 'Alta Confiança', color: 'var(--color-success)', count: counts.high },
      { key: 'medium', label: 'Média Confiança', color: 'var(--color-warning)', count: counts.medium },
      { key: 'low', label: 'Baixa Confiança (Ou Ceticismo)', color: 'var(--color-danger)', count: counts.low }
    ];
    let html = '<div style="display:flex; flex-direction:column; gap:12px;">';
    levels.forEach(lvl => {
      const pct = total > 0 ? Math.round((lvl.count / total) * 100) : 0;
      html += `
        <div>
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:4px;">
            <span style="font-weight:600; color:var(--text-color);">${lvl.label}</span>
            <span style="color:var(--text-secondary);">${lvl.count} respostas (${pct}%)</span>
          </div>
          <div style="height:8px; width:100%; background:var(--border-color); border-radius:10px; overflow:hidden;">
            <div style="height:100%; background:${lvl.color}; width:${pct}%; transition: width 0.8s ease-in-out;"></div>
          </div>
        </div>
      `;
    });
    html += '</div>';
    container.innerHTML = html;
  }
};
