/**
 * LUNARAYS TECHNOLOGIES - MAIN INTERACTIVE ENGINE
 * Features:
 * - Interactive WebGL/Canvas Shader Hero Background
 * - Animated Counting Metrics (Trust Slip)
 * - 3D Zoom & Flip Full-Detail Service Modal (80% Viewport)
 * - 5-Step Delivery Roadmap & IT Operations Management Revealer
 * - Dynamic Two-Column Contextual Industries Switcher
 * - Sliding Split-Screen Proposal Request Form
 * - Floating AI Assistant Chatbot (Luna AI)
 */

document.addEventListener('DOMContentLoaded', () => {
  initShaderHero();
  initCounters();
  initServicesModal();
  initDeliveryOperations();
  initIndustriesMatrix();
  initSlidingCTA();
  initAIAssistant();
  initNavigation();
});

/* ==========================================================================
   1. HERO CANVAS SHADER ANIMATION (21st.dev Fluid Shader Hero Style)
   ========================================================================== */
function initShaderHero() {
  const canvas = document.getElementById('shaderCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Create particles for glowing mesh — reduce on mobile for performance
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile
    ? Math.min(Math.floor((width * height) / 30000), 35)
    : Math.min(Math.floor((width * height) / 12000), 100);
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 2.5 + 1,
      color: Math.random() > 0.4 ? 'rgba(239, 68, 68,' : 'rgba(59, 130, 246,'
    });
  }

  let time = 0;
  function animate() {
    time += 0.01;
    ctx.clearRect(0, 0, width, height);

    // Render fluid ambient gradient waves
    const gradient = ctx.createRadialGradient(
      width * 0.5 + Math.sin(time * 0.5) * 100,
      height * 0.4 + Math.cos(time * 0.3) * 60,
      50,
      width * 0.5,
      height * 0.5,
      width * 0.7
    );
    gradient.addColorStop(0, 'rgba(198, 40, 40, 0.18)');
    gradient.addColorStop(0.5, 'rgba(37, 99, 235, 0.12)');
    gradient.addColorStop(1, 'rgba(7, 11, 19, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Update & connect particles
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Mouse interactivity
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - p.x;
        let dy = mouse.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          let force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 3;
          p.y -= (dy / dist) * force * 3;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + ' 0.6)';
      ctx.fill();

      // Connect near particles with laser lines
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          let alpha = (1 - dist / 110) * 0.25;
          ctx.strokeStyle = `rgba(226, 232, 240, ${alpha})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   2. TRUST SLIP / ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initCounters() {
  const cards = document.querySelectorAll('.trust-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const targetNum = parseInt(card.getAttribute('data-counter'), 10);
        const countSpan = card.querySelector('.count');
        animateValue(countSpan, 0, targetNum, 2000);
        obs.unobserve(card);
      }
    });
  }, { threshold: 0.3 });

  cards.forEach(card => observer.observe(card));

  function animateValue(element, start, end, duration) {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const easedProgress = progress * (2 - progress);
      const current = Math.floor(easedProgress * (end - start) + start);
      element.textContent = current;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = end;
      }
    }
    window.requestAnimationFrame(step);
  }
}

/* ==========================================================================
   3. SERVICES SECTION (CARD CLICK -> 80% SCREEN 3D FLIP/ZOOM MODAL)
   ========================================================================== */
const servicesData = {
  'microsoft-365': {
    title: 'Microsoft 365 Migration, Deployment & Support Services',
    category: 'Cloud & Workplace Productivity',
    lead: 'Lunarays helps organizations transition and manage Microsoft-based workplace and email environments. Services include Office 365 migration, Exchange migration, Active Directory migration consulting, Microsoft application support and ongoing system updates.',
    deliverables: [
      'Microsoft 365 environment assessment',
      'Office 365 migration planning',
      'Office 365 migration',
      'Exchange Server migration',
      'Active Directory migration consulting',
      'Enterprise email configuration and support',
      'Microsoft application implementation',
      'Microsoft system updates',
      'Security patch support',
      'Post-migration technical support'
    ],
    techStack: 'Microsoft 365, Office 365, Exchange, Active Directory, Enterprise Email, Microsoft Applications',
    sla: '24×7 Support • Proactive Monitoring • 4-Hour Guaranteed Response Time for Managed Plans'
  },
  'cloud-services': {
    title: 'Cloud Infrastructure & Migration Services',
    category: 'Cloud Infrastructure, Migration & Modernization',
    lead: 'Lunarays Cloud Services focuses on helping organizations transition from traditional IT infrastructure to flexible, scalable cloud environments. The service scope covers cloud migration, infrastructure deployment, cloud environment management, and hybrid infrastructure support across platforms such as AWS and Microsoft Azure. The offering is designed to support cloud adoption, infrastructure modernization, operational continuity, and evolving business technology requirements.',
    deliverables: [
      'Cloud readiness assessment',
      'Cloud migration planning',
      'AWS cloud infrastructure support',
      'Microsoft Azure infrastructure support',
      'On-premises to cloud migration',
      'Cloud infrastructure deployment',
      'Hybrid cloud environment support',
      'Cloud resource management',
      'Cloud monitoring and maintenance',
      'Infrastructure modernization',
      'Cloud backup and recovery support',
      'Cloud security configuration support',
      'Cloud cost optimization',
      'Post-migration technical assistance'
    ],
    techStack: 'Amazon Web Services (AWS), Microsoft Azure, Cloud Infrastructure, Hybrid Cloud, Virtual Machines, Cloud Storage, Cloud Networking, Backup & Recovery, Infrastructure Monitoring',
    sla: 'Cloud Support Options • Migration Scope-Based Delivery • Infrastructure Monitoring • Technical Escalation Support'
  },
  'it-infrastructure-managed': {
    title: 'IT Infrastructure & Managed Services',
    category: 'IT Infrastructure, Operations & Managed Support',
    lead: 'Lunarays provides IT infrastructure and managed services to support business-critical technology environments. The service portfolio covers infrastructure operations, network management, IT asset lifecycle support, information security, and technical assistance to help organizations maintain reliable and efficient IT operations.',
    deliverables: [
      'IT infrastructure assessment',
      'Server and workstation management',
      'Network operations and support',
      'IT asset lifecycle management',
      'Infrastructure monitoring and maintenance',
      'Information security support',
      'Remote technical assistance',
      'Helpdesk and end-user support',
      'IT installation and relocation',
      'Infrastructure optimization',
      'Preventive maintenance',
      'Technical escalation support'
    ],
    techStack: 'IT Infrastructure, Servers, Workstations, Networking, IT Asset Management, Information Security, Remote Support, Helpdesk, Enterprise IT Operations',
    sla: 'Managed Support Options • Response-Time Commitments as per Service Plan • Priority Escalation • Preventive Maintenance'
  },
  'application-services': {
    title: 'Application Development, Implementation & Management',
    category: 'Application Engineering & Management',
    lead: 'Lunarays provides application services spanning solution development, implementation, application management, transition, enhancement and continuous improvement. The company also describes the use of RPA and BOT technologies for process digitization.',
    deliverables: [
      'Business requirement analysis',
      'Application solutioning',
      'Application development',
      'Application implementation',
      'Application transition',
      'Application operations',
      'Application enhancement',
      'Application maintenance',
      'Process digitization',
      'RPA/BOT implementation',
      'Application monitoring',
      'Continuous improvement'
    ],
    techStack: 'Enterprise Applications, RPA, BOT Technology, Web Applications, Mobile Applications, Databases, Cloud Platforms',
    sla: 'Application-Specific SLA • Managed Support Options • Response & Resolution Based on Service Agreement'
  },
  'infor-services': {
    title: 'Infor Supply Chain Execution & Enterprise Asset Management',
    category: 'Enterprise Applications & Business Operations',
    lead: 'Lunarays lists Infor Services as a dedicated service category focused on Supply Chain Execution and Enterprise Asset Management.',
    deliverables: [
      'Infor solution assessment',
      'Supply Chain Execution support',
      'Enterprise Asset Management support',
      'Business-process alignment',
      'Application implementation support',
      'Application maintenance',
      'Integration support',
      'Technical support'
    ],
    techStack: 'Infor, Supply Chain Execution, Enterprise Asset Management, Enterprise Applications, Business Operations Systems',
    sla: 'Managed Support Options • SLA Defined by Service Agreement • Technical Escalation Support'
  },
  'database-support': {
    title: 'Enterprise Database Support & Management Services',
    category: 'Database Infrastructure & Support',
    lead: 'Lunarays describes database support as a core component of enterprise software infrastructure, with emphasis on database efficiency, security, user management and data accessibility.',
    deliverables: [
      'Database environment assessment',
      'Database administration support',
      'User-data management',
      'Database security',
      'Authentication support',
      'Authorization management',
      'Redundancy checks',
      'Database maintenance',
      'Database hosting support',
      'Performance and operational support'
    ],
    techStack: 'Oracle, MySQL, PostgreSQL, Enterprise Databases, Web Applications, Cloud Infrastructure, Application Platforms',
    sla: 'Database Support SLA • Monitoring & Maintenance • Response Based on Service Agreement'
  },
  'oracle-retail-fusion': {
    title: 'Oracle Retail & Fusion Enterprise Solutions',
    category: 'Enterprise Applications & Retail Technology',
    lead: 'Lunarays positions Oracle Retail & Fusion services toward retail organizations and mission-critical enterprise environments. The service portfolio references cloud adoption and Oracle-based business applications.',
    deliverables: [
      'Oracle environment assessment',
      'Oracle Retail solution support',
      'Oracle Fusion support',
      'Cloud adoption support',
      'Application implementation',
      'Application maintenance',
      'Enterprise application support',
      'Business-process alignment',
      'Mission-critical application support'
    ],
    techStack: 'Oracle Retail, Oracle Fusion, HCM, Financial Services Management, CRM, Cloud Infrastructure, Enterprise Applications',
    sla: 'Managed Support Options • Application-Specific SLA • Technical Escalation Support'
  },
  'mobility': {
    title: 'Enterprise Mobility & Mobile Application Services',
    category: 'Mobile Application & Digital Transformation',
    lead: 'Lunarays\' Mobility offering focuses on helping organizations define mobility roadmaps and implement mobile solutions across the application lifecycle, including design, migration, testing, maintenance and reporting.',
    deliverables: [
      'Mobility strategy and roadmap',
      'Mobile application design',
      'Application implementation',
      'Application migration',
      'Mobile application testing',
      'Application maintenance',
      'Reporting',
      'Debugging',
      'Technology-platform assessment',
      'User-adoption planning',
      'Mobility architecture support'
    ],
    techStack: 'Mobile Applications, Enterprise Applications, Mobile Platforms, Cloud Infrastructure, Application Development, Testing Tools',
    sla: 'Application-Specific SLA • Maintenance & Support • Response Based on Service Agreement'
  }
};

function initServicesModal() {
  const cards = document.querySelectorAll('.service-card');
  const backdrop = document.getElementById('serviceModalBackdrop');
  const modalContainer = document.getElementById('modalDynamicContent');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!cards.length || !backdrop || !modalContainer) return;

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const serviceId = card.getAttribute('data-service-id');
      const data = servicesData[serviceId];
      if (!data) return;

      const iconSvg = card.querySelector('.service-icon-box svg')?.outerHTML || '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';

      modalContainer.innerHTML = `
        <div class="modal-header-hero">
          <div class="modal-hero-icon">
            ${iconSvg}
          </div>
          <div>
            <span class="service-tag">${data.category}</span>
            <h2 class="modal-headline">${data.title}</h2>
          </div>
        </div>

        <p class="section-lead" style="margin-bottom: 30px;">${data.lead}</p>

        <div class="modal-grid-cols">
          <div>
            <h3 class="modal-col-title">Core Engineering Deliverables</h3>
            <ul class="modal-features-list">
              ${data.deliverables.map(item => `
                <li>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <div>
            <div class="modal-box-card">
              <h4 style="font-family: var(--font-subheading); font-size: 0.85rem; font-weight: 700; color: var(--color-primary); margin-bottom: 8px;">TECHNOLOGY ECOSYSTEM</h4>
              <p style="font-size: 0.95rem; color: var(--color-text-main); font-weight: 400;">${data.techStack}</p>
            </div>

            <div class="modal-box-card">
              <h4 style="font-family: var(--font-subheading); font-size: 0.85rem; font-weight: 700; color: var(--color-accent-blue); margin-bottom: 8px;">SLA & SUPPORT COMMITMENT</h4>
              <p style="font-size: 0.95rem; color: var(--color-text-main); font-weight: 400;">${data.sla}</p>
            </div>

            <div style="margin-top: 24px;">
              <a href="#cta" onclick="document.getElementById('serviceModalBackdrop').classList.remove('active');" class="btn btn-primary btn-block">
                Request Architecture Consultation &rarr;
              </a>
            </div>
          </div>
        </div>
      `;

      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   4. HOW SERVICES ARE DELIVERED (ROADMAP + EXPLORE MORE OPERATIONS)
   ========================================================================== */
function initDeliveryOperations() {
  const toggleBtn = document.getElementById('toggleOperationsBtn');
  const operationsSection = document.getElementById('operationsManagedSection');

  if (!toggleBtn || !operationsSection) return;

  toggleBtn.addEventListener('click', () => {
    const isActive = operationsSection.classList.toggle('active');
    if (isActive) {
      toggleBtn.innerHTML = `<span class="btn-explore-main">Collapse View &uarr;</span><span class="btn-explore-divider"></span><span class="btn-explore-sub">Hide IT Operations Framework</span>`;
      operationsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      toggleBtn.innerHTML = `<span class="btn-explore-main">Explore more &rarr;</span><span class="btn-explore-divider"></span><span class="btn-explore-sub">See How IT Operations Are Managed</span>`;
    }
  });
}

/* ==========================================================================
   5. WHO WE SUPPORT (TWO-COLUMN INTERACTIVE INDUSTRIES SWITCHER)
   ========================================================================== */
const industriesData = [
  {
    title: 'Global In-House (GCCs)',
    counter: '01 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    desc: 'Standardized IT workplace fleets, high-throughput SD-WAN interconnects, and round-the-clock ITIL service desks for global technology centers in India.',
    priorities: ['Global Fleet Uniformity', 'Zero-Trust Remote Work', 'High-Speed WAN Connects', '24/7 Helpdesk'],
    capabilities: ['Workplace End-User Compute', 'SD-WAN & SASE Security', 'License Consolidation', 'Dedicated NOC Pods']
  },
  {
    title: 'Manufacturing',
    counter: '02 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
    desc: 'Industrial IoT integration, Infor ERP & WMS automation, and shop-floor networking ensuring continuous assembly lines and supply chain execution.',
    priorities: ['Shop Floor Reliability', 'Supply Chain Visibility', 'Predictive Maintenance', 'Asset Tracking'],
    capabilities: ['Infor LN & WMS Systems', 'Industrial Rugged LAN', 'SCADA / OT Security', 'Automated Barcode Systems']
  },
  {
    title: 'Telecom',
    counter: '03 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
    desc: 'Ultra-low-latency backbone routing, carrier-grade switching, and multi-tenant cloud orchestration for telecom providers and internet service providers.',
    priorities: ['Low Latency Throughput', 'Carrier-Grade SLAs', 'DDoS Mitigation', 'Massive Scale'],
    capabilities: ['Next-Gen Core Routers', 'BGP Peering Architecture', 'Edge Computing Nodes', 'Automated Failover']
  },
  {
    title: 'Financial Services',
    counter: '04 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>`,
    desc: 'Technology environments for banking institutions, NBFCs, and FinTech platforms where resilience, regulatory risk, and 100% transaction availability are non-negotiable.',
    priorities: ['Regulatory Compliance', 'Zero Data Loss', 'High Availability', 'Auditability'],
    capabilities: ['Core Banking Network Fabric', 'Disaster Recovery (DR) Sync', 'Cybersecurity SOC', 'Database Clusters']
  },
  {
    title: 'Healthcare',
    counter: '05 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>`,
    desc: 'Mission-critical Hospital Information Systems (HIS), PACS imaging networks, and diagnostic infrastructure engineered for continuous care with zero downtime.',
    priorities: ['HIPAA / ISO Data Privacy', '24/7 HIS Uptime', 'Telemetry Continuity', 'Secure EMR Access'],
    capabilities: ['PACS Cloud Archiving', 'Encrypted Campus Wi-Fi', 'High-IOPS Server Nodes', 'Redundant Power Fabrics']
  },
  {
    title: 'Public Services',
    counter: '06 / 06',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4"></path></svg>`,
    desc: 'Secure municipal infrastructure, government e-portal hosting, and national digital initiative backbones built with strict sovereign data standards.',
    priorities: ['Public Accountability', 'Sovereign Data Storage', 'Strict SLA Compliance', 'Cost Efficiency'],
    capabilities: ['Government Cloud Portals', 'Centralized Identity Access', 'Audit Trail Telemetry', 'Annual Maintenance (AMC)']
  }
];

function initIndustriesMatrix() {
  const tabs = document.querySelectorAll('.industry-nav-btn');
  const panel = document.getElementById('industryDisplayPanel');
  const panelTitle = document.getElementById('panelTitle');
  const panelDesc = document.getElementById('panelDesc');
  const panelCounter = document.getElementById('panelCounter');
  const panelIcon = document.getElementById('panelIcon');
  const panelPriorities = document.getElementById('panelPriorities');
  const panelCapabilities = document.getElementById('panelCapabilities');

  if (!tabs.length || !panel) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.getAttribute('data-industry-index'), 10);
      const data = industriesData[idx];
      if (!data) return;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      panel.classList.add('fade-out');

      setTimeout(() => {
        panelTitle.textContent = data.title;
        panelDesc.textContent = data.desc;
        panelCounter.textContent = data.counter;
        panelIcon.innerHTML = data.icon;

        panelPriorities.innerHTML = data.priorities
          .map(p => `<span class="pill pill-purple">${p}</span>`)
          .join('');

        panelCapabilities.innerHTML = data.capabilities
          .map(c => `<span class="pill pill-blue">${c}</span>`)
          .join('');

        panel.classList.remove('fade-out');
      }, 150);
    });
  });
}

/* ==========================================================================
   6. CTA SECTION (SLIDING SPLIT-SCREEN FORM)
   ========================================================================== */
function initSlidingCTA() {
  const ctaContainer = document.getElementById('ctaContainer');
  const openBtn = document.getElementById('ctaOpenFormBtn');
  const closeBtn = document.getElementById('ctaCloseFormBtn');

  // On mobile, scroll to form panel after opening
  if (openBtn && ctaContainer) {
    openBtn.addEventListener('click', () => {
      if (window.innerWidth < 640) {
        setTimeout(() => {
          const formPanel = document.querySelector('.cta-right-form-panel');
          if (formPanel) formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  }
  const dialog = document.getElementById('proposalSuccessDialog');
  const dialogCloseBtn = document.getElementById('proposalDialogCloseBtn');

  if (openBtn && ctaContainer) {
    openBtn.addEventListener('click', () => {
      ctaContainer.classList.add('form-open');
      const firstInput = document.getElementById('fullName');
      if (firstInput) firstInput.focus();
    });
  }

  if (closeBtn && ctaContainer) {
    closeBtn.addEventListener('click', () => {
      ctaContainer.classList.remove('form-open');
    });
  }

  // Dialogue Box Event Listeners
  if (dialogCloseBtn) {
    dialogCloseBtn.addEventListener('click', closeProposalDialog);
  }
  if (dialog) {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeProposalDialog();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dialog && dialog.classList.contains('active')) {
      closeProposalDialog();
    }
  });
}

let proposalDialogTimer = null;

function closeProposalDialog() {
  const dialog = document.getElementById('proposalSuccessDialog');
  if (dialog) {
    dialog.classList.remove('active');
  }
  if (proposalDialogTimer) {
    clearTimeout(proposalDialogTimer);
    proposalDialogTimer = null;
  }
}

window.handleProposalSubmit = function () {
  const form = document.getElementById('proposalForm');
  const dialog = document.getElementById('proposalSuccessDialog');

  if (dialog) {
    dialog.classList.add('active');

    if (proposalDialogTimer) {
      clearTimeout(proposalDialogTimer);
    }

    // Auto-close the dialogue box in 3 seconds
    proposalDialogTimer = setTimeout(() => {
      closeProposalDialog();
    }, 3000);
  }

  // Reset form inputs, keep CTA form visible (do not hide)
  if (form) {
    form.reset();
  }
};

/* ==========================================================================
   7. AI ASSISTANT WIDGET (LUNA AI CHATBOT)
   ========================================================================== */
function initAIAssistant() {
  const avatarBtn = document.getElementById('aiAvatarBtn');
  const chatWindow = document.getElementById('aiChatWindow');
  const closeBtn = document.getElementById('aiChatCloseBtn');

  if (!avatarBtn || !chatWindow) return;

  function setOpen(isOpen) {
    chatWindow.classList.toggle('active', isOpen);
    chatWindow.setAttribute('aria-hidden', String(!isOpen));
    avatarBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) document.getElementById('chatInput')?.focus();
  }

  avatarBtn.addEventListener('click', () => setOpen(!chatWindow.classList.contains('active')));

  if (closeBtn) {
    closeBtn.addEventListener('click', () => setOpen(false));
  }

  document.getElementById('chatSendBtn')?.addEventListener('click', window.handleSendChatMessage);
  document.getElementById('chatInput')?.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      window.handleSendChatMessage();
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && chatWindow.classList.contains('active')) setOpen(false);
  });
}

const lunaConversation = [];
const LUNA_HISTORY_LIMIT = 12;
const LUNA_MAX_MESSAGE_LENGTH = 2000;
let lunaRequestPending = false;

window.sendQuickPrompt = function (promptText) {
  if (typeof promptText !== 'string') return;
  const chatWindow = document.getElementById('aiChatWindow');
  const avatarBtn = document.getElementById('aiAvatarBtn');
  chatWindow?.classList.add('active');
  chatWindow?.setAttribute('aria-hidden', 'false');
  avatarBtn?.setAttribute('aria-expanded', 'true');
  submitLunaMessage(promptText);
};

window.handleSendChatMessage = function () {
  const input = document.getElementById('chatInput');
  if (!input || lunaRequestPending) return;
  const text = input.value.trim();
  if (!text) return;
  if (text.length > LUNA_MAX_MESSAGE_LENGTH) {
    appendChatMessage(`Please keep your message to ${LUNA_MAX_MESSAGE_LENGTH} characters or fewer.`, 'bot');
    return;
  }
  input.value = '';
  submitLunaMessage(text);
};

async function submitLunaMessage(text) {
  if (lunaRequestPending) return;
  const chatBody = document.getElementById('chatBody');
  const sendButton = document.getElementById('chatSendBtn');
  if (!chatBody) return;

  lunaRequestPending = true;
  if (sendButton) sendButton.disabled = true;
  appendChatMessage(text, 'user');
  const typingMessage = appendChatMessage('Luna is typing…', 'bot', 'typing');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: lunaConversation.slice(-LUNA_HISTORY_LIMIT)
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || 'Luna could not respond right now. Please try again.');
    if (typeof payload.reply !== 'string' || !payload.reply.trim()) {
      throw new Error('Luna could not respond right now. Please try again.');
    }

    lunaConversation.push({ role: 'user', content: text }, { role: 'assistant', content: payload.reply });
    lunaConversation.splice(0, Math.max(0, lunaConversation.length - LUNA_HISTORY_LIMIT));
    typingMessage?.remove();
    appendChatMessage(payload.reply, 'bot');
  } catch (error) {
    typingMessage?.remove();
    appendChatMessage(error?.message === 'Failed to fetch'
      ? 'I’m having trouble connecting right now. Please try again shortly or contact info@lunaraystechnologies.com.'
      : (error?.message || 'Luna could not respond right now. Please try again.'), 'bot', 'error');
  } finally {
    lunaRequestPending = false;
    if (sendButton) sendButton.disabled = false;
    document.getElementById('chatInput')?.focus();
  }
}

function appendChatMessage(text, sender, extraClass = '') {
  const chatBody = document.getElementById('chatBody');
  if (!chatBody || typeof text !== 'string') return null;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}${extraClass ? ` ${extraClass}` : ''}`;
  if (sender === 'bot') msgDiv.setAttribute('aria-live', 'polite');
  const paragraph = document.createElement('p');
  const emailLinkMarkup = '[info@lunaraystechnologies.com](mailto:info@lunaraystechnologies.com)';
  const emailLinkIndex = sender === 'bot' ? text.indexOf(emailLinkMarkup) : -1;
  if (emailLinkIndex < 0) {
    paragraph.textContent = text;
  } else {
    paragraph.append(document.createTextNode(text.slice(0, emailLinkIndex)));
    const emailLink = document.createElement('a');
    emailLink.href = 'mailto:info@lunaraystechnologies.com';
    emailLink.textContent = 'info@lunaraystechnologies.com';
    paragraph.append(emailLink, document.createTextNode(text.slice(emailLinkIndex + emailLinkMarkup.length)));
  }
  msgDiv.appendChild(paragraph);
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
  return msgDiv;
}

/* ==========================================================================
   8. NAVIGATION & MOBILE MENU
   ========================================================================== */
function initNavigation() {
  const links = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section');
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-open');
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        document.body.style.overflow = '';
      });
    });

    // Close mobile nav when clicking outside
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('mobile-open') &&
        !navLinks.contains(e.target) &&
        !mobileToggle.contains(e.target)) {
        mobileToggle.classList.remove('active');
        navLinks.classList.remove('mobile-open');
        document.body.style.overflow = '';
      }
    });
  }

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      if (section.offsetTop <= scrollPos && section.offsetTop + section.offsetHeight > scrollPos) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
