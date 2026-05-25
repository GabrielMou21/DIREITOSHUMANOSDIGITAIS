// Gerenciador do Canal de Denúncias e Acompanhamento
const ReportManager = {
  currentTab: 'register', // 'register' ou 'my-reports'
  selectedReportId: null,
  uploadedImageBase64: null,
  init() {
    this.currentTab = 'register';
    this.selectedReportId = null;
    this.uploadedImageBase64 = null;
    this.renderTabs();
  },
  switchTab(tab) {
    this.currentTab = tab;
    this.selectedReportId = null;
    this.renderTabs();
  },
  renderTabs() {
    const registerBtn = document.getElementById('tab-btn-register');
    const listBtn = document.getElementById('tab-btn-list');
    const registerForm = document.getElementById('report-register-form');
    const reportsListContainer = document.getElementById('reports-list-container');
    if (!registerBtn || !listBtn || !registerForm || !reportsListContainer) return;
    if (this.currentTab === 'register') {
      registerBtn.classList.add('active');
      listBtn.classList.remove('active');
      registerForm.style.display = 'block';
      reportsListContainer.style.display = 'none';
      this.resetForm();
    } else {
      registerBtn.classList.remove('active');
      listBtn.classList.add('active');
      registerForm.style.display = 'none';
      reportsListContainer.style.display = 'block';
      this.renderReportsList();
    }
  },
  // Processa o upload de imagem e converte para Base64
  handleFileUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('upload-preview');
    if (!file || !preview) return;
    if (file.size > 2 * 1024 * 1024) {
      App.showToast('Arquivo muito grande! Máximo 2MB.', 'alert-triangle');
      event.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedImageBase64 = e.target.result;
      preview.innerHTML = `<img src="${this.uploadedImageBase64}" alt="Preview do arquivo">`;
      App.showToast('Evidência carregada com sucesso!', 'check-circle');
    };
    reader.readAsDataURL(file);
  },
  toggleAnonymous() {
    const check = document.getElementById('rep-anonymous');
    const contactGroup = document.getElementById('contact-info-group');
    if (check && contactGroup) {
      if (check.checked) {
        contactGroup.style.display = 'none';
        document.getElementById('rep-contact').removeAttribute('required');
      } else {
        contactGroup.style.display = 'block';
        document.getElementById('rep-contact').setAttribute('required', 'true');
      }
    }
  },
  // Submete uma nova denúncia
  submitReport(event) {
    event.preventDefault();
    const categorySelect = document.getElementById('rep-category');
    const descTextarea = document.getElementById('rep-desc');
    const anonCheck = document.getElementById('rep-anonymous');
    const contactInput = document.getElementById('rep-contact');
    if (!categorySelect || !descTextarea) return;
    const category = categorySelect.value;
    const categoryLabel = categorySelect.options[categorySelect.selectedIndex].text;
    const description = descTextarea.value.trim();
    const anonymous = anonCheck ? anonCheck.checked : true;
    const contact = (!anonymous && contactInput) ? contactInput.value.trim() : null;
    if (!category || !description) {
      App.showToast('Por favor, preencha os campos obrigatórios.', 'alert-triangle');
      return;
    }
    const newReport = {
      id: 'rep_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      date: new Date().toLocaleDateString('pt-BR'),
      category: category,
      categoryLabel: categoryLabel,
      description: description,
      status: 'pending',
      attachment: this.uploadedImageBase64,
      anonymous: anonymous,
      contact: contact,
      timeline: [
        {
          date: new Date().toLocaleDateString('pt-BR'),
          title: "Registro Efetuado",
          desc: "Denúncia cadastrada com sucesso no observatório digital de direitos humanos."
        }
      ]
    };
    DB.saveReport(newReport);
    App.showToast('Denúncia registrada com sucesso!', 'check-circle');
    this.switchTab('my-reports');
  },
  resetForm() {
    const form = document.getElementById('report-form-el');
    if (form) form.reset();
    const preview = document.getElementById('upload-preview');
    if (preview) preview.innerHTML = 'Nenhum arquivo anexado (Máx 2MB)';
    this.uploadedImageBase64 = null;
    this.toggleAnonymous();
  },
  // Renderiza a lista de denúncias
  renderReportsList() {
    const listContainer = document.getElementById('reports-list-container');
    if (!listContainer) return;
    const reports = DB.getReports();
    if (reports.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
          <svg style="width: 48px; height: 48px; margin-bottom: 12px; stroke: var(--text-muted);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Nenhuma denúncia cadastrada localmente.</p>
        </div>
      `;
      return;
    }
    if (this.selectedReportId) {
      this.renderReportDetail(listContainer, reports);
      return;
    }
    let listHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <h4 style="font-family: var(--font-heading); font-size:14px; font-weight:700;">Denúncias no Dispositivo</h4>
        <span style="font-size:11px; color:var(--primary); font-weight:700;">Toque para ver a linha do tempo</span>
      </div>
      <div class="report-list">
    `;
    reports.forEach((rep) => {
      const badgeClass = `badge-${rep.status}`;
      const isAnonText = rep.anonymous ? 'Anônima' : `Contato: ${rep.contact}`;
      listHTML += `
        <div class="report-card" onclick="ReportManager.viewDetail('${rep.id}')">
          <div class="report-card-header">
            <span class="report-badge badge-${rep.status}">${DB.translateStatus(rep.status)}</span>
            <span class="report-date">${rep.date}</span>
          </div>
          <h5 class="report-title">${rep.categoryLabel}</h5>
          <p class="report-description">${rep.description.substring(0, 80)}${rep.description.length > 80 ? '...' : ''}</p>
          <div style="font-size: 11px; color: var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
            <span>ID: ${rep.id.substring(4, 9)}</span>
            <span>${isAnonText}</span>
          </div>
        </div>
      `;
    });
    listHTML += '</div>';
    listContainer.innerHTML = listHTML;
  },
  viewDetail(id) {
    this.selectedReportId = id;
    this.renderReportsList();
  },
  closeDetail() {
    this.selectedReportId = null;
    this.renderReportsList();
  },
  // Exibe a linha do tempo detalhada e a simulação de administração
  renderReportDetail(container, reports) {
    const rep = reports.find(r => r.id === this.selectedReportId);
    if (!rep) {
      this.selectedReportId = null;
      this.renderReportsList();
      return;
    }
    let timelineHTML = '';
    rep.timeline.forEach((step, idx) => {
      const completedClass = idx === 0 ? 'completed' : '';
      timelineHTML += `
        <div class="timeline-step ${completedClass}">
          <div class="timeline-step-title">${step.title}</div>
          <div style="font-size: 10px; color: var(--text-muted); margin: 2px 0 4px 0;">${step.date}</div>
          <div class="timeline-step-desc">${step.desc}</div>
        </div>
      `;
    });
    let attachmentHTML = '';
    if (rep.attachment) {
      attachmentHTML = `
        <div style="margin-top: 14px;">
          <div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Anexo de Prova / Evidência:</div>
          <div style="width:100%; max-height:160px; overflow:hidden; border-radius:8px; border:1px solid var(--border-color);">
            <img src="${rep.attachment}" style="width:100%; height:100%; object-fit:cover;">
          </div>
        </div>
      `;
    }
    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button class="btn-outline" onclick="ReportManager.closeDetail()" style="padding: 6px 12px; width: auto; font-size:12px; display:inline-flex; align-items:center; gap:4px;">
          <svg style="width:14px; height:14px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar à Lista
        </button>
      </div>
      <div class="glass-card" style="margin-bottom: 20px;">
        <div class="report-card-header" style="margin-bottom: 12px;">
          <span class="report-badge badge-${rep.status}" style="font-size:11px;">${DB.translateStatus(rep.status)}</span>
          <span class="report-date">${rep.date}</span>
        </div>
        <h4 class="report-title" style="font-size:17px; margin-bottom: 10px;">${rep.categoryLabel}</h4>
        <p style="font-size:13px; color:var(--text-secondary); line-height:1.5; white-space: pre-wrap; margin-bottom:14px;">
          ${rep.description}
        </p>
        <div style="font-size: 11px; color: var(--text-muted); border-top:1px solid var(--border-color); padding-top:10px;">
          <p>ID da Ocorrência: <code>${rep.id}</code></p>
          <p>Privacidade: <strong>${rep.anonymous ? 'Denúncia Anônima' : 'Contato: ' + rep.contact}</strong></p>
        </div>
        ${attachmentHTML}
      </div>
      <div class="glass-card card-primary" style="margin-bottom: 20px;">
        <h5 style="font-family:var(--font-heading); font-size:14px; font-weight:700; margin-bottom:12px; color:var(--primary);">Linha do Tempo de Acompanhamento</h5>
        <div class="timeline">
          ${timelineHTML}
        </div>
      </div>
      <!-- PAINEL ADMINISTRATIVO SIMULADO -->
      <div class="glass-card" style="border: 1px dashed var(--secondary); background: rgba(16, 185, 129, 0.03);">
        <h5 style="font-family:var(--font-heading); font-size:13px; font-weight:700; color:var(--secondary); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
          🔧 Área de Extensão Acadêmica (Painel Admin)
        </h5>
        <p style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
          Como estudante/pesquisador extensionista, você pode simular a gestão deste caso alterando o status e adicionando notas de andamento.
        </p>
        <div class="form-group">
          <label class="form-label" style="font-size:11px;">Novo Status</label>
          <select id="admin-status-select" class="form-control" style="font-size:12px; padding:8px 12px;">
            <option value="pending" ${rep.status === 'pending' ? 'selected' : ''}>Pendente</option>
            <option value="analyzing" ${rep.status === 'analyzing' ? 'selected' : ''}>Em Análise</option>
            <option value="resolved" ${rep.status === 'resolved' ? 'selected' : ''}>Concluído / Resolvido</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size:11px;">Descreva a Ação Tomada</label>
          <input type="text" id="admin-status-note" class="form-control" style="font-size:12px; padding:8px 12px;" placeholder="Ex: Encaminhado boletim de ocorrência à Safernet...">
        </div>
        <button class="btn-primary" onclick="ReportManager.adminUpdateStatus()" style="padding:10px; font-size:12px; background:var(--secondary); box-shadow:none;">
          Atualizar Caso e Notificar Vítima
        </button>
      </div>
    `;
  },
  adminUpdateStatus() {
    const statusSelect = document.getElementById('admin-status-select');
    const noteInput = document.getElementById('admin-status-note');
    if (!statusSelect || !noteInput) return;
    const newStatus = statusSelect.value;
    const noteText = noteInput.value.trim();
    if (!noteText) {
      App.showToast('Por favor, descreva a ação tomada para justificar.', 'alert-triangle');
      return;
    }
    const success = DB.updateReportStatus(this.selectedReportId, newStatus, noteText);
    if (success) {
      App.showToast('Status atualizado com sucesso no BD local!', 'check-circle');
      this.renderReportsList();
    }
  }
};
