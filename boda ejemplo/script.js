// ── SPARKLES (Destellos) ──
(function(){
  const c = document.getElementById('sparkles');
  if(!c) return;
  for(let i=0; i<28; i++){
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-delay:${Math.random()*4}s;
      animation-duration:${2+Math.random()*3}s;
      width:${3+Math.random()*5}px;
      height:${3+Math.random()*5}px;
      background:${Math.random()>.5 ? '#e8c96b' : '#C0392B'};
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
  for(let i=0; i<22; i++){
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
      animation: fall ${10+Math.random()*12}s linear infinite;
      animation-delay: ${Math.random()*14}s;
    `;
    pc.appendChild(p);
  }
})();


// ════════════════════════════════════════
// ── LÓGICA URL ?d= (NO MODIFICAR) ──
// ════════════════════════════════════════
function decodificarUTF8(str) {
    try {
        const binario = atob(str);
        const bytes = new Uint8Array(binario.length);
        for (let i = 0; i < binario.length; i++) {
            bytes[i] = binario.charCodeAt(i);
        }
        return new TextDecoder().decode(bytes);
    } catch (e) {
        console.error("Error en decodificación UTF8:", e);
        return null;
    }
}

function obtenerDatosURL() {
    const params = new URLSearchParams(window.location.search);
    const dataEncoded = params.get('d');

    if (dataEncoded) {
        const decodedString = decodificarUTF8(dataEncoded);

        if (decodedString) {
            const [nombre, pases] = decodedString.split('|');

            const elNombreSobre = document.getElementById('nombre-invitado-sobre');
            if (elNombreSobre) elNombreSobre.textContent = nombre;

            if (document.getElementById('ticket-invitado'))
                document.getElementById('ticket-invitado').textContent = nombre;
            if (document.getElementById('ticket-pases'))
                document.getElementById('ticket-pases').textContent = pases || "1";

            window._rsvpData = { nombre, pases: pases || "1" };

            const elRsvpNombre = document.getElementById('rsvp-nombre-display');
            if (elRsvpNombre) elRsvpNombre.textContent = nombre;

        } else {
            mostrarValoresPorDefecto();
        }
    } else {
        mostrarValoresPorDefecto();
    }
}

function mostrarValoresPorDefecto() {
    const defect = "Invitado Especial";
    if (document.getElementById('nombre-invitado-sobre'))
        document.getElementById('nombre-invitado-sobre').textContent = defect;
    if (document.getElementById('ticket-invitado'))
        document.getElementById('ticket-invitado').textContent = defect;
    if (document.getElementById('ticket-pases'))
        document.getElementById('ticket-pases').textContent = "--";

    window._rsvpData = { nombre: defect, pases: "1" };
    const elRsvpNombreDef = document.getElementById('rsvp-nombre-display');
    if (elRsvpNombreDef) elRsvpNombreDef.textContent = defect;
}


// ── ABRIR SOBRE ──
function abrirSobre() {
    const sobreImg = document.getElementById('img-sobre');
    const wrapper  = document.getElementById('sobre-wrapper');
    const musica   = document.getElementById('musica-invitacion');

    document.getElementById('btn-musica').style.display = 'block';

    // Reemplaza con tu imagen de sobre abierto
    sobreImg.src = "sobre abierto.png";

    if (musica) {
        musica.volume = 0;
        musica.play().catch(err => console.log("Audio bloqueado:", err));
        let vol = 0;
        const fadeIn = setInterval(() => {
            if (vol < 0.3) { vol += 0.05; musica.volume = vol; }
            else clearInterval(fadeIn);
        }, 200);
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

    const { nombre, pases } = window._rsvpData || { nombre: "Invitado", pases: "1" };

    document.getElementById('f-nombre').value    = nombre;
    document.getElementById('f-pases').value     = pases;
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


// ── COUNTDOWN — 26 nov 2026 ──
(function(){
  const target   = new Date('2026-11-28T20:00:00');
  const grid     = document.getElementById('countdown-grid');
  const todayMsg = document.getElementById('event-today');

  function update(){
    const now  = new Date();
    const diff = target - now;
    const sameDay = now.getFullYear()===2026 && now.getMonth()===10 && now.getDate()===28;

    if(sameDay || diff <= 0){
      if(grid)     grid.style.display     = 'none';
      if(todayMsg) todayMsg.style.display = 'block';
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
  setInterval(update, 1000);
})();


// ── MÚSICA ──
const musica = document.getElementById('musica-invitacion');
const icon   = document.getElementById('musica-icon');
const VOLUMEN_MAXIMO = 0.3;
let fadeInterval;
let estabaReproduciendo = false; // Guarda el estado de reproducción antes de que la página se oculte

function toggleMusica() {
    if (musica.paused) {
        musica.volume = 0;
        musica.play();
        icon.textContent = "🔊";
        fadeInMusica();
    } else {
        clearInterval(fadeInterval);
        musica.pause();
        icon.textContent = "🔇";
    }
}

function fadeInMusica() {
    clearInterval(fadeInterval);
    fadeInterval = setInterval(() => {
        if (musica.volume < VOLUMEN_MAXIMO) {
            musica.volume = Math.min(musica.volume + 0.05, VOLUMEN_MAXIMO);
        } else {
            clearInterval(fadeInterval);
        }
    }, 200);
}

// Controlar la música cuando el usuario minimiza, cambia de pestaña o bloquea el celular
document.addEventListener('visibilitychange', () => {
    if (!musica) return;

    if (document.visibilityState === 'hidden') {
        // Si la música está sonando, la pausamos y recordamos que estaba activa
        if (!musica.paused) {
            estabaReproduciendo = true;
            clearInterval(fadeInterval);
            musica.pause();
        } else {
            estabaReproduciendo = false;
        }
    } else if (document.visibilityState === 'visible') {
        // Si estaba sonando antes de ocultarse, la reanudamos con efecto fade-in
        if (estabaReproduciendo) {
            musica.volume = 0;
            musica.play().catch(err => console.log("Audio bloqueado al reanudar:", err));
            fadeInMusica();
        }
    }
});


// ── INICIO ──
window.addEventListener('DOMContentLoaded', () => {
    obtenerDatosURL();
});



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
