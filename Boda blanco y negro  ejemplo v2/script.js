// ── SPARKLES (Destellos dorados en el hero) ──
(function(){
  const c = document.getElementById('sparkles');
  if(!c) return;
  for(let i=0; i<15; i++){
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-delay:${Math.random()*4}s;
      animation-duration:${2+Math.random()*3}s;
      width:${3+Math.random()*5}px;
      height:${3+Math.random()*5}px;
      background:${Math.random()>.5 ? '#e8c96b' : '#c9a84c'};
    `;
    c.appendChild(s);
  }
})();

// ── PARTÍCULAS ANIMADAS · BRILLOS DORADOS ──
(function(){
  const pc = document.getElementById('petals-container');
  if(!pc) return;
  pc.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;overflow:hidden;';
  const colors = ['#c9a84c', '#e8c96b', '#f7e9c4'];
  for(let i=0; i<12; i++){
    const p = document.createElement('div');
    p.className = 'petal';
    const tam = 2 + Math.random()*3;
    p.style.cssText = `
      position:absolute;
      top:-20px;
      left:${Math.random()*100}%;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      width:${tam}px;
      height:${tam}px;
      opacity:0;
      animation: fall ${12+Math.random()*10}s linear infinite;
      animation-delay: ${Math.random()*10}s;
    `;
    pc.appendChild(p);
  }

  // Pausar animaciones de partículas cuando la pestaña no está visible (ahorro de batería y recursos)
  document.addEventListener('visibilitychange', () => {
    const estado = document.hidden ? 'paused' : 'running';
    pc.querySelectorAll('.petal').forEach(p => { p.style.animationPlayState = estado; });
  });
})();


// ════════════════════════════════════════
// ── DATOS DEL INVITADO POR URL (?d=) ──
// Formato principal (igual que la última boda): Base64 de un JSON
//   {"name":"Familia Pérez","passes":"4","tipoInvitado":"novia"}
// También acepta Base64 de "nombre|pases|novio" y parámetros simples (?n=&p=&ti=)
// ════════════════════════════════════════
function decodificarUTF8(str) {
    try {
        let b64 = String(str).trim().replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const binario = atob(b64);
        const bytes = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.error("Error en decodificación UTF8:", e);
        return null;
    }
}

function leerDatosInvitado() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('d') || params.get('guest');
    let nombre = null, pases = null, tipo = null, folio = null;

    if (raw) {
        const dec = decodificarUTF8(raw);
        if (dec) {
            let obj = null;
            try { obj = JSON.parse(dec); } catch (e) { obj = null; }
            if (obj && typeof obj === 'object') {
                nombre = obj.name || obj.nombre || null;
                pases  = obj.passes || obj.pases || null;
                tipo   = obj.tipoInvitado || obj.tipo || null;
                folio  = obj.folio || null;
            } else {
                const partes = dec.split('|');
                nombre = partes[0] || null;
                pases  = partes[1] || null;
                tipo   = partes[2] || null;
                folio  = partes[3] || null;
            }
        }
    }
    if (!nombre) nombre = params.get('n') || params.get('nombre');
    if (!pases)  pases  = params.get('p') || params.get('pases');
        if (!tipo)   tipo   = params.get('ti') || params.get('tipo_invitado');
    if (!folio)  folio  = params.get('f') || params.get('folio');

    tipo = tipo ? String(tipo).trim().toLowerCase() : null;
    if (tipo !== 'novio' && tipo !== 'novia') tipo = null;

    return {
        nombre: nombre ? String(nombre).trim() : null,
        pases:  pases  ? String(pases).trim()  : null,
        folio:  folio  ? String(folio).trim()  : null,
        tipo
    };
}

let _invitado = { nombre: "Invitado Especial", pases: null, tipo: null, folio: null };
let _maxPases = 1;
let _pasesSeleccionados = 1;
let _pasesValido = false;

function setTexto(id, texto) {
    const el = document.getElementById(id);
    if (el) el.textContent = texto;
}

function aplicarDatosInvitado() {
    const d = leerDatosInvitado();
    _invitado = {
        nombre: d.nombre || "Invitado Especial",
        pases:  d.pases,
        folio:  d.folio,
        tipo:   d.tipo
    };

    // Sobre, pase y RSVP
    setTexto('nombre-invitado-sobre', _invitado.nombre);
    setTexto('ticket-invitado', _invitado.nombre);
    setTexto('ticket-pases', _invitado.pases || "--");
    setTexto('rsvp-nombre-display', _invitado.nombre);

    // Invitado de la novia / del novio
    if (_invitado.tipo) {
        const etiquetaPase = _invitado.tipo === 'novia' ? 'Invitado de la novia' : 'Invitado del novio';
        const etiquetaRsvp = _invitado.tipo === 'novia' ? 'Invitación por parte de la novia' : 'Invitación por parte del novio';
        setTexto('ticket-tipo', etiquetaPase);
        const grupo = document.getElementById('ticket-tipo-group');
        if (grupo) grupo.style.display = '';
        const rsvpTipo = document.getElementById('rsvp-tipo-invitado');
        if (rsvpTipo) { rsvpTipo.textContent = etiquetaRsvp; rsvpTipo.style.display = 'block'; }
    }

    // Selector de pases (solo permite reducir, nunca superar el máximo del link)
    const rawPases = _invitado.pases ? parseInt(_invitado.pases, 10) : NaN;
    _pasesValido = Number.isFinite(rawPases) && rawPases >= 1;
    _maxPases = _pasesValido ? rawPases : 1;
    _pasesSeleccionados = _maxPases;

    const selector = document.getElementById('pases-selector');
    const valorEl  = document.getElementById('pases-selector-valor');
    const btnMenos = document.getElementById('pases-menos');
    const btnMas   = document.getElementById('pases-mas');

    function refrescar() {
        if (valorEl)  valorEl.textContent = _pasesSeleccionados;
        if (btnMenos) btnMenos.disabled = _pasesSeleccionados <= 1;
        if (btnMas)   btnMas.disabled   = _pasesSeleccionados >= _maxPases;
        setTexto('ticket-pases', _pasesSeleccionados);
    }
    if (selector) {
        if (_maxPases > 1) {
            selector.style.display = 'block';
            refrescar();
            if (btnMenos) {
                btnMenos.onclick = () => {
                    if (_pasesSeleccionados > 1) {
                        _pasesSeleccionados--;
                        refrescar();
                    }
                };
            }
            if (btnMas) {
                btnMas.onclick = () => {
                    if (_pasesSeleccionados < _maxPases) {
                        _pasesSeleccionados++;
                        refrescar();
                    }
                };
            }
        } else {
            selector.style.display = 'none';
            refrescar();
        }
    }
}


// ════════════════════════════════════════
// ── MÚSICA (se pausa al minimizar / bloquear / cambiar de pestaña) ──
// ════════════════════════════════════════
const musica = document.getElementById('musica-invitacion');
const iconoMusica = document.getElementById('musica-icon');
const VOLUMEN_MAXIMO = 0.3;
let musicaActiva = false;   // true = el invitado quiere música (no la silenció)
let fadeInterval;

function reproducirMusica() {
    if (!musica) return;
    clearInterval(fadeInterval);
    musica.volume = 0;
    try {
        const p = musica.play();
        if (p !== undefined) {
            p.then(() => {
                fadeInterval = setInterval(() => {
                    if (musica.volume < VOLUMEN_MAXIMO) {
                        musica.volume = Math.min(musica.volume + 0.05, VOLUMEN_MAXIMO);
                    } else {
                        clearInterval(fadeInterval);
                    }
                }, 200);
            }).catch(err => {
                console.log("Audio bloqueado o en espera de interacción:", err);
            });
        }
    } catch(err) {
        console.log("Error de audio:", err);
    }
}

function pausarPorSegundoPlano() {
    if (!musica) return;
    clearInterval(fadeInterval);
    if (!musica.paused) musica.pause();
}

function reanudarSiCorresponde() {
    if (musicaActiva && musica && musica.paused && !document.hidden) reproducirMusica();
}

function toggleMusica() {
    if (!musica) return;
    if (musicaActiva) {
        musicaActiva = false;
        clearInterval(fadeInterval);
        musica.pause();
        if (iconoMusica) iconoMusica.textContent = "🔇";
    } else {
        musicaActiva = true;
        reproducirMusica();
        if (iconoMusica) iconoMusica.textContent = "🔊";
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.hidden) pausarPorSegundoPlano();
    else reanudarSiCorresponde();
});
window.addEventListener('pagehide', pausarPorSegundoPlano);
window.addEventListener('pageshow', reanudarSiCorresponde);


// ── ABRIR SOBRE ──
function abrirSobre() {
    const sobreImg = document.getElementById('img-sobre');
    const wrapper  = document.getElementById('sobre-wrapper');

    document.getElementById('btn-musica').style.display = 'block';

    // Reemplaza con tu imagen de sobre abierto
    sobreImg.src = "sobre abierto2.png";

    if (musica) {
        musicaActiva = true;
        if (iconoMusica) iconoMusica.textContent = "🔊";
        reproducirMusica();
    }

    setTimeout(() => { wrapper.classList.add('sobre-oculto'); }, 900);
}


// ════════════════════════════════════════
// ── RSVP ──
// ════════════════════════════════════════
let respuestaSeleccionada = "";

function seleccionarRespuesta(valor) {
    respuestaSeleccionada = valor;
    const btnSi = document.getElementById('btn-si');
    const btnNo = document.getElementById('btn-no');
    if(btnSi) btnSi.classList.toggle('active', valor === 'Sí asistiré');
    if(btnNo) btnNo.classList.toggle('active', valor === 'No podré asistir');
}

function enviarRSVP() {
    if (!respuestaSeleccionada) {
        alert("Por favor, selecciona una opción para confirmar.");
        return;
    }

    // El número de pases final confirmado por el usuario (editable hacia abajo, nunca arriba del URL)
    // Si la persona marca "No podré asistir", se registran 0 pases confirmados; si marca "Sí asistiré", el valor elegido.
    const pasesEnviar = respuestaSeleccionada === 'No podré asistir' ? "0" : String(_pasesSeleccionados);

    document.getElementById('f-nombre').value     = _invitado.nombre;
    document.getElementById('f-pases').value      = pasesEnviar;
        document.getElementById('f-tipo').value       = _invitado.tipo || '';
    document.getElementById('f-folio').value      = _invitado.folio || '';
    document.getElementById('f-asistencia').value = respuestaSeleccionada;

    document.getElementById('form-google-oculto').submit();

    const titleEl = document.getElementById('success-title');
    const textEl  = document.getElementById('success-text');
    const footEl  = document.getElementById('success-footer');
    const emojiEl = document.getElementById('success-emoji');

    if (respuestaSeleccionada === 'Sí asistiré') {
        titleEl.textContent = "¡Excelente noticia!";
        textEl.textContent  = "Muchas gracias, hemos registrado tu asistencia.";
        footEl.textContent  = "¡Nos vemos el 28 de Noviembre para celebrar la boda!";
        emojiEl.textContent = "💍";
    } else {
        titleEl.textContent = "¡Te extrañaremos!";
        textEl.textContent  = "Tu respuesta ha sido registrada. Lamentamos que no puedas acompañarnos.";
        footEl.textContent  = "¡Gracias por avisarnos!";
        emojiEl.textContent = "💌";
    }

    document.getElementById('rsvp-form-content').style.display = 'none';
    document.getElementById('rsvp-success').style.display = 'block';
    document.getElementById('rsvp-success').scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// ── COUNTDOWN — termina a las 23:59:59 del 24 OCTUBRE 2027 ──
// Al entrar el 24 de OCTUBRE (00:00) se oculta el contador y aparece el mensaje del gran día.
(function(){
  const target   = new Date('2027-10-24T00:00:00');
  const grid     = document.getElementById('countdown-grid');
  const label    = document.getElementById('cd-label');
  const titulo   = document.getElementById('cd-titulo');
  const todayMsg = document.getElementById('event-today');
  let timer;

  function update(){
    const diff = target - new Date();

    if(diff <= 0){
      if(grid)     grid.style.display     = 'none';
      if(label)    label.style.display    = 'none';
      if(titulo)   titulo.style.display   = 'none';
      if(todayMsg) todayMsg.style.display = 'block';
      clearInterval(timer);
      return;
    }

    const dias  = Math.floor(diff / 86400000);
    const horas = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000)  / 60000);
    const segs  = Math.floor((diff % 60000)    / 1000);

    document.getElementById('cd-dias').textContent  = String(dias).padStart(2,'0');
    document.getElementById('cd-horas').textContent = String(horas).padStart(2,'0');
    document.getElementById('cd-min').textContent   = String(mins).padStart(2,'0');
    document.getElementById('cd-seg').textContent   = String(segs).padStart(2,'0');
  }

  update();
  timer = setInterval(update, 1000);
})();


// ── REVELADO AL HACER SCROLL (fotos y textos) ──
(function () {
  const els = document.querySelectorAll('.reveal-obs');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '30px 0px 30px 0px' });
  els.forEach(el => io.observe(el));
})();


// ── INICIO ──
window.addEventListener('DOMContentLoaded', () => {
    aplicarDatosInvitado();
});


// ══════════════════════════════════════
// ── GALERÍA · CARRUSEL DESLIZABLE + LIGHTBOX ──
// (No hace nada si la sección de galería está comentada en el HTML)
// ══════════════════════════════════════
(function () {
  const track  = document.getElementById('carrusel-track');
  const dotsEl = document.getElementById('carrusel-dots');
  if (!track) return;

  const items = Array.from(track.querySelectorAll('.carrusel-item'));
  const total = items.length;
  let fotoActual = 0;

  items.forEach((item, i) => {
    item.addEventListener('click', () => abrirFoto(i));
    const dot = document.createElement('span');
    dot.className = 'carrusel-dot' + (i === 0 ? ' activo' : '');
    dot.addEventListener('click', () => {
      items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    });
    dotsEl.appendChild(dot);
  });

  // Sincroniza el punto activo con el scroll (swipe táctil nativo del navegador)
  let scrollTimeout;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const centro = track.scrollLeft + track.clientWidth / 2;
      let idxCercano = 0, distMin = Infinity;
      items.forEach((item, i) => {
        const dist = Math.abs((item.offsetLeft + item.offsetWidth / 2) - centro);
        if (dist < distMin) { distMin = dist; idxCercano = i; }
      });
      document.querySelectorAll('.carrusel-dot').forEach((d, i) => d.classList.toggle('activo', i === idxCercano));
    }, 100);
  }, { passive: true });

  const srcsFotos = items.map(item => item.querySelector('img').src);

  window.abrirFoto = function (idx) {
    fotoActual = idx;
    const overlay = document.getElementById('lightbox-overlay');
    const img     = document.getElementById('lightbox-img');
    img.src = srcsFotos[fotoActual];
    img.alt = items[fotoActual].querySelector('img').alt;
    overlay.classList.add('activo');
    document.body.style.overflow = 'hidden';
  };

  window.cerrarLightbox = function (e) {
    const overlay = document.getElementById('lightbox-overlay');
    if (e.target === overlay || (e.currentTarget && e.currentTarget.classList && e.currentTarget.classList.contains('lightbox-close'))) {
      overlay.classList.remove('activo');
      document.body.style.overflow = '';
    }
  };

  window.lightboxNavegar = function (dir, e) {
    if (e && e.stopPropagation) e.stopPropagation();
    fotoActual = (fotoActual + dir + total) % total;
    const img = document.getElementById('lightbox-img');
    img.style.opacity = '0';
    setTimeout(() => {
      img.src = srcsFotos[fotoActual];
      img.alt = items[fotoActual].querySelector('img').alt;
      img.style.opacity = '1';
    }, 150);
    img.style.transition = 'opacity .15s ease';
  };

  // Swipe táctil dentro del lightbox para pasar de foto
  const overlayEl = document.getElementById('lightbox-overlay');
  let touchStartX = 0;
  overlayEl.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  overlayEl.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      window.lightboxNavegar(delta > 0 ? -1 : 1, { stopPropagation: () => {} });
    }
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (!overlayEl.classList.contains('activo')) return;
    if (e.key === 'Escape')     window.cerrarLightbox({ target: overlayEl });
    if (e.key === 'ArrowRight') window.lightboxNavegar(1, { stopPropagation: () => {} });
    if (e.key === 'ArrowLeft')  window.lightboxNavegar(-1, { stopPropagation: () => {} });
  });
})();



// ══ BOTÓN VOLVER AL INICIO ══
(function () {
  const btnTop = document.getElementById('btn-top');
  if (!btnTop) return;
  const UMBRAL = () => document.getElementById('inicio')?.offsetHeight ?? 300;
  window.addEventListener('scroll', () => {
    if (window.scrollY > UMBRAL()) {
      btnTop.classList.add('visible');
    } else {
      btnTop.classList.remove('visible');
    }
  }, { passive: true });
})();