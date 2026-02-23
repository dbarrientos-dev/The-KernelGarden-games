/* ============================================================
   THE KERNELGARDEN GAMES — main.js
   Funcionalidades: menú, scroll reveal, partículas,
   modo claro/oscuro, navbar activo, contador animado
   ============================================================ */

'use strict';

/* ── Esperar a que el DOM esté listo ── */
document.addEventListener('DOMContentLoaded', function () {

  iniciarParticulasFondo();
  iniciarMenuMovil();
  iniciarScrollReveal();
  iniciarNavbarActivo();
  iniciarContadoresAnimados();
  iniciarToggleTema();
  iniciarEasterEgg();

});

/* ============================================================
   1. PARTÍCULAS DE FONDO
   Puntos dorados que flotan lentamente en el fondo.
   ============================================================ */

function iniciarParticulasFondo() {
  var canvas = document.getElementById('particulas-fondo');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var particulas = [];
  var NUM_PARTICULAS = 55;

  /* Adaptar canvas al tamaño de ventana */
  function redimensionar() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  redimensionar();
  window.addEventListener('resize', redimensionar);

  /* Crear partículas */
  for (var i = 0; i < NUM_PARTICULAS; i++) {
    particulas.push(crearParticula());
  }

  function crearParticula() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 1.5 + 0.4,
      dx:   (Math.random() - 0.5) * 0.35,
      dy:   (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.1,
      /* alternar entre dorado y abalache */
      color: Math.random() > 0.6 ? '#A8D8EA' : '#D4A017'
    };
  }

  function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particulas.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      /* Mover */
      p.x += p.dx;
      p.y += p.dy;

      /* Rebotar en los bordes */
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(dibujar);
  }

  dibujar();
}


/* ============================================================
   2. MENÚ MÓVIL
   Abre/cierra el menú en pantallas pequeñas.
   ============================================================ */

function iniciarMenuMovil() {
  var btn    = document.getElementById('btn-menu');
  var menu   = document.getElementById('nav-links');
  if (!btn || !menu) return;

  btn.addEventListener('click', function () {
    var estaAbierto = menu.classList.toggle('abierto');
    btn.classList.toggle('abierto', estaAbierto);

    /* Accesibilidad: aria-expanded */
    btn.setAttribute('aria-expanded', estaAbierto ? 'true' : 'false');
    menu.setAttribute('aria-hidden',  estaAbierto ? 'false' : 'true');
  });

  /* Cerrar al hacer clic en un enlace */
  menu.querySelectorAll('a').forEach(function (enlace) {
    enlace.addEventListener('click', function () {
      menu.classList.remove('abierto');
      btn.classList.remove('abierto');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    });
  });

  /* Cerrar al hacer clic fuera */
  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('abierto');
      btn.classList.remove('abierto');
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
    }
  });
}


/* ============================================================
   3. SCROLL REVEAL
   Detecta elementos con clase .reveal y los hace visibles
   cuando entran en el viewport.
   ============================================================ */

function iniciarScrollReveal() {
  /* Usar IntersectionObserver si está disponible */
  if (!('IntersectionObserver' in window)) {
    /* Fallback: mostrar todo */
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var opciones = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.12
  };

  var observador = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target); /* Animación solo una vez */
      }
    });
  }, opciones);

  document.querySelectorAll('.reveal').forEach(function (el) {
    observador.observe(el);
  });
}


/* ============================================================
   4. NAVBAR ACTIVO
   Resalta el link del navbar según la sección visible.
   ============================================================ */

function iniciarNavbarActivo() {
  var secciones = document.querySelectorAll('section[id]');
  var links = document.querySelectorAll('.nav-links a[href^="#"]');
  if (!secciones.length || !links.length) return;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    var seccionActual = '';

    secciones.forEach(function (sec) {
      if (scrollY >= sec.offsetTop - 120) {
        seccionActual = sec.id;
      }
    });

    links.forEach(function (link) {
      var href = link.getAttribute('href').replace('#', '');
      if (href === seccionActual) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, { passive: true });
}


/* ============================================================
   5. CONTADORES ANIMADOS
   Anima los números de las estadísticas al entrar en pantalla.
   ============================================================ */

function iniciarContadoresAnimados() {
  var contadores = document.querySelectorAll('[data-count]');
  if (!contadores.length) return;

  if (!('IntersectionObserver' in window)) {
    contadores.forEach(function (el) {
      el.textContent = el.dataset.count;
    });
    return;
  }

  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (entrada) {
      if (!entrada.isIntersecting) return;

      var el = entrada.target;
      var objetivo = parseFloat(el.dataset.count);
      var esDecimal = String(el.dataset.count).includes('.');
      var sufijo = el.dataset.sufijo || '';
      var inicio = 0;
      var duracion = 1400;
      var inicio_tiempo = null;

      function tick(timestamp) {
        if (!inicio_tiempo) inicio_tiempo = timestamp;
        var progreso = Math.min((timestamp - inicio_tiempo) / duracion, 1);
        /* Easing out quad */
        var ease = 1 - (1 - progreso) * (1 - progreso);
        var valor = inicio + (objetivo - inicio) * ease;

        el.textContent = esDecimal
          ? valor.toFixed(1) + sufijo
          : Math.floor(valor) + sufijo;

        if (progreso < 1) requestAnimationFrame(tick);
        else el.textContent = objetivo + sufijo;
      }

      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  contadores.forEach(function (el) { obs.observe(el); });
}


/* ============================================================
   6. TOGGLE MODO CLARO / OSCURO
   Guarda la preferencia en localStorage.
   ============================================================ */

function iniciarToggleTema() {
  var toggle = document.getElementById('toggle-tema');
  if (!toggle) return;

  /* Cargar preferencia guardada */
  var guardado = localStorage.getItem('kg-tema');
  if (guardado === 'claro') {
    document.body.classList.add('modo-claro');
    toggle.checked = true;
  }

  /* Detectar preferencia del sistema si no hay guardado */
  if (!guardado && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.classList.add('modo-claro');
    toggle.checked = true;
  }

  toggle.addEventListener('change', function () {
    if (toggle.checked) {
      document.body.classList.add('modo-claro');
      localStorage.setItem('kg-tema', 'claro');
    } else {
      document.body.classList.remove('modo-claro');
      localStorage.setItem('kg-tema', 'oscuro');
    }
  });
}


/* ============================================================
   7. EASTER EGG
   Presionar la secuencia ↑ ↑ ↓ ↓ ← → ← → B A activa
   un mensaje oculto.
   ============================================================ */

function iniciarEasterEgg() {
  var secuencia = [
    'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
    'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
    'b','a'
  ];
  var indice = 0;

  document.addEventListener('keydown', function (e) {
    if (e.key === secuencia[indice]) {
      indice++;
      if (indice === secuencia.length) {
        indice = 0;
        mostrarEasterEgg();
      }
    } else {
      indice = 0;
    }
  });
}

function mostrarEasterEgg() {
  /* Crear toast */
  var toast = document.createElement('div');
  toast.setAttribute('role', 'alert');
  toast.style.cssText = [
    'position:fixed',
    'bottom:28px',
    'left:50%',
    'transform:translateX(-50%) translateY(80px)',
    'background:linear-gradient(135deg,#D4A017,#c48c10)',
    'color:#0A0B0E',
    'font-family:var(--font-display,sans-serif)',
    'font-size:0.88rem',
    'font-weight:800',
    'padding:14px 28px',
    'border-radius:999px',
    'box-shadow:0 8px 28px rgba(212,160,23,0.5)',
    'z-index:9999',
    'transition:transform 0.4s ease, opacity 0.4s ease',
    'opacity:0',
    'letter-spacing:1px'
  ].join(';');
  toast.textContent = '🌱 ¡KernelGarden activa! Colombia 🇨🇴';
  document.body.appendChild(toast);

  /* Animar entrada */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity   = '1';
    });
  });

  /* Animar salida */
  setTimeout(function () {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    toast.style.opacity   = '0';
    setTimeout(function () { toast.remove(); }, 500);
  }, 3500);
}