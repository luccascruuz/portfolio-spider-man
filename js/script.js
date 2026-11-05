// IIFE: mantém as variáveis fora do escopo global.
// (Não usamos type="module" porque módulos não rodam abrindo o index.html direto do disco.)
(() => {
    const header = document.querySelector('header');
    const menu = document.querySelector('#menu-icon');
    const navlist = document.querySelector('.navlist');
    const navLinks = document.querySelectorAll('.navlist a');

    /* ---------- Header fixo ---------- */
    // Um marcador invisível a 100px do topo: quando ele sai da tela, o header vira "sticky".
    // Substitui o listener de scroll, que rodava a cada pixel rolado.
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:100px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);

    new IntersectionObserver(([entry]) => {
        header.classList.toggle('sticky', !entry.isIntersecting);
    }).observe(sentinel);

    /* ---------- Menu mobile ---------- */
    const setMenu = (open) => {
        navlist.classList.toggle('open', open);
        menu.classList.toggle('bx-x', open);
        menu.classList.toggle('bx-menu', !open);
        menu.setAttribute('aria-expanded', String(open));
        menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    };

    menu.addEventListener('click', () => setMenu(!navlist.classList.contains('open')));
    navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) setMenu(false);
    });
    // Se a tela crescer para desktop com o menu aberto, reseta o estado
    window.matchMedia('(min-width: 821px)').addEventListener('change', (e) => {
        if (e.matches) setMenu(false);
    });

    /* ---------- Fade-in das imagens ---------- */
    // O lazy load é nativo (loading="lazy" no HTML); aqui só mostramos a imagem
    // quando o download termina. "error" também libera, para não ficar invisível.
    document.querySelectorAll('img.lazy').forEach((img) => {
        const done = () => img.classList.add('loaded');
        if (img.complete) return done();
        img.addEventListener('load', done, { once: true });
        img.addEventListener('error', done, { once: true });
    });

    /* ---------- Animação de entrada ---------- */
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    /* ---------- Link ativo conforme a seção ---------- */
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinks.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    document.querySelectorAll('main section[id]').forEach((s) => sectionObserver.observe(s));

    /* ---------- Formulário de contato ---------- */
    const form = document.querySelector('#contact-form');
    const formStatus = document.querySelector('#form-status');

    const showStatus = (msg, type) => {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            form.classList.add('validated');
            const invalid = form.querySelector(':invalid');
            const label = form.querySelector(`label[for="${invalid.id}"]`).textContent;
            showStatus(`Confira o campo "${label}".`, 'error');
            invalid.focus();
            return;
        }

        const nome = form.nome.value.trim().split(/\s+/)[0];
        showStatus(`Valeu, ${nome}! Seu sinal chegou. Respondo assim que terminar a patrulha. 🕷️`, 'success');
        form.reset();
        form.classList.remove('validated');
    });

    // Some com o erro assim que o usuário corrige tudo
    form.addEventListener('input', () => {
        if (form.classList.contains('validated') && form.checkValidity()) {
            form.classList.remove('validated');
            showStatus('', '');
        }
    });

    /* ---------- Compartilhar ---------- */
    const shareLink = document.querySelector('#share-link');
    const shareText = shareLink.textContent;

    shareLink.addEventListener('click', async (e) => {
        e.preventDefault();
        const flash = (msg) => {
            shareLink.textContent = msg;
            setTimeout(() => (shareLink.textContent = shareText), 2000);
        };

        if (navigator.share) {
            try {
                await navigator.share({ title: document.title, url: location.href });
            } catch (err) {
                if (err.name !== 'AbortError') flash('Não foi possível compartilhar');
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(location.href);
            flash('Link copiado!');
        } catch {
            flash('Copie o link na barra de endereço');
        }
    });

    /* ---------- Ano no rodapé ---------- */
    document.querySelector('#year').textContent = new Date().getFullYear();
})();
