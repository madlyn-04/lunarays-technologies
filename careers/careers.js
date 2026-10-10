document.addEventListener('DOMContentLoaded', () => {
  initHomeNavigation();
  const nav = document.getElementById('careersNav');
  const mobileToggle = document.getElementById('mobileToggle');
  initWhatsAppFooterPosition();

  if (nav && mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('mobile-open');
      mobileToggle.classList.toggle('active', isOpen);
      mobileToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        mobileToggle.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const filters = document.querySelectorAll('.career-filter');
  const roleCards = document.querySelectorAll('.career-role-card');
  const noResults = document.getElementById('careerNoResults');

  filters.forEach(filter => {
    filter.addEventListener('click', () => {
      const category = filter.dataset.filter;
      let visibleCount = 0;

      filters.forEach(button => {
        const isActive = button === filter;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });

      roleCards.forEach(card => {
        const isVisible = category === 'all' || card.dataset.category === category;
        card.hidden = !isVisible;
        if (isVisible) visibleCount += 1;
      });

      if (noResults) noResults.hidden = visibleCount > 0;
    });
  });

  const careerForm = document.getElementById('careerForm');
  if (!careerForm) return;

  const submitButton = careerForm.querySelector('button[type="submit"]');
  const status = document.getElementById('careerFormStatus');

  careerForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!careerForm.reportValidity() || submitButton.disabled) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Sending profile…';
    status.textContent = '';
    status.classList.remove('success');
    const emailPayload = Object.fromEntries(new FormData(careerForm).entries());

    try {
      const response = await fetch('https://formsubmit.co/ajax/info@lunaraystechnologies.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(emailPayload)
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Submission was not accepted.');
      }

      careerForm.reset();
      status.textContent = 'Thanks — your profile was sent successfully.';
      status.classList.add('success');
    } catch {
      status.textContent = 'We could not send your profile right now. Please try again or email info@lunaraystechnologies.com.';
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = 'Submit profile <span aria-hidden="true">→</span>';
    }
  });
});

function initHomeNavigation() {
  document.addEventListener('click', event => {
    const homeLink = event.target.closest('a.home-link');
    if (!homeLink || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        homeLink.target === '_blank' || homeLink.hasAttribute('download')) {
      return;
    }

    const isHomePage = document.body.dataset.homePage === 'true';
    if (isHomePage) {
      event.preventDefault();
      if (/^https?:$/.test(window.location.protocol) && window.location.hash) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    event.preventDefault();
    const homeUrl = window.location.protocol === 'file:'
      ? new URL('index.html', document.baseURI)
      : new URL('/', window.location.origin);
    homeUrl.search = window.location.search;
    window.location.assign(homeUrl.href);
  });
}

function initWhatsAppFooterPosition() {
  const whatsappContainer = document.querySelector('.whatsapp-float-container');
  const whatsappLink = whatsappContainer?.querySelector('.whatsapp-float-btn');
  const footerLinks = document.querySelector('.main-footer .footer-bottom-links');
  if (!whatsappContainer || !whatsappLink || !footerLinks) return;

  const floatingHome = whatsappContainer;
  const footerPosition = footerLinks.querySelector('[aria-label="Facebook"]');
  let footerMode = false;
  let transitionTimer;

  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !footerMode) {
      footerMode = true;
      whatsappLink.classList.add('is-shrinking');
      transitionTimer = window.setTimeout(() => {
        if (!footerMode) return;
        footerLinks.insertBefore(whatsappLink, footerPosition?.nextSibling ?? null);
        whatsappContainer.hidden = true;
        whatsappLink.classList.remove('is-shrinking');
        whatsappLink.classList.add('is-footer-icon');
      }, 220);
    } else if (!entry.isIntersecting && footerMode) {
      footerMode = false;
      window.clearTimeout(transitionTimer);
      whatsappLink.classList.remove('is-shrinking');
      whatsappLink.classList.remove('is-footer-icon');
      whatsappLink.classList.add('is-expanding');
      floatingHome.appendChild(whatsappLink);
      whatsappContainer.hidden = false;
      window.requestAnimationFrame(() => {
        whatsappLink.classList.remove('is-expanding');
      });
    }
  }, { threshold: 0.01 });

  observer.observe(footerLinks);
}
