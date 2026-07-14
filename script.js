/* ═══════════════ DATA ═══════════════ */

const SECTIONS = [
  ['s-decoder',   'Decodificador'],
  ['s-equipos',   'Equipos'],
  ['s-cables',    'Cables'],
  ['s-celdas',    'Celdas y casetes'],
  ['s-energia',   'Energía'],
  ['s-estaciones','Estaciones'],
  ['s-quiz',      'Práctica'],
];

const EQUIPOS = [
  { tag:'SW210', role:'Switch Central', d:'Red Box. Es el hub de toda la red del ODF. Conecta hasta 16 celdas y concentra el tráfico de todos los switches 3U.', v:'SW210Esxxxx · 24 Vcc' },
  { tag:'SWyyy', role:'Switch 3U (Eurocard)', d:'Conecta las celdas de media tensión por fibra óptica. 8 puertos F1–F8. El número yyy es el último octeto de su IP.', v:'SWyyyEsxxxx · 24 Vcc' },
  { tag:'FW240', role:'Firewall', d:'FortiGate Rugged 30D. Separa la red interna del ODF de la red corporativa. LAN3 hacia adentro, LAN4 hacia el Tablero TC.', v:'FW240Esxxxx · 12 Vcc' },
  { tag:'CK231', role:'Reloj GPS', d:'Sincroniza el tiempo de todos los equipos de protección. Alimenta la antena GPS del techo por su salida POE.', v:'CK231Esxxxx · 24 Vcc' },
  { tag:'C24',   role:'Conversor', d:'Transforma la alterna de la subestación en 24 Vcc y 12 Vcc. En estaciones críticas hay dos (C24A y C24B) para redundancia.', v:'110/24V · AC → CC' },
  { tag:'Casete 3U', role:'Casete de fibra', d:'Aloja los conectores LC de una o varias celdas. Lleva un acrílico al frente con la celda a la que se conecta.', v:'30/C01 · 15/C04' },
];

/* Decoder token rules — order matters */
const RULES = [
  { re:/^SW(\d{3})$/i, cls:'c-eq', kind:'Equipo',
    fn:m=>{ const n=+m[1];
      if(n===210) return 'Switch Central (Red Box). Hub de toda la red del ODF.';
      const lado = (n>=221) ? 'lado B' : 'lado A';
      return 'Switch 3U Eurocard, '+lado+'. Su IP termina en .'+m[1]+'.';
    }},
  { re:/^SW(\d{3})(?:Es|ES|E)(\w+)$/i, cls:'c-eq', kind:'Equipo + estación',
    fn:m=>{ const n=+m[1];
      const rol = n===210 ? 'Switch Central' : 'Switch 3U (IP .'+m[1]+', '+(n>=221?'lado B':'lado A')+')';
      return rol+' de la estación '+m[2]+'.';
    }},
  { re:/^FW(\d{3})(?:(?:Es|ES|E)(\w+))?$/i, cls:'c-eq', kind:'Equipo',
    fn:m=>'Firewall FortiGate Rugged 30D'+(m[2]?' de la estación '+m[2]:'')+'. Único equipo a 12 Vcc.' },
  { re:/^CK(\d{3})(?:(?:Es|ES|E)(\w+))?$/i, cls:'c-eq', kind:'Equipo',
    fn:m=>'Reloj GPS'+(m[2]?' de la estación '+m[2]:'')+'. Sincroniza el tiempo de la red de protección.' },
  { re:/^C24[AB]?$/i, cls:'c-eq', kind:'Equipo',
    fn:m=>'Conversor de tensión 110/24 V. Genera la corriente continua del tablero.' },
  { re:/^Q(220|24|A24|B24)$/i, cls:'c-eq', kind:'Protección',
    fn:m=>({'220':'Breaker de la alterna 220 Vac — 40 A.','24':'Breaker del bus de continua 24 Vcc — 10 A.',
            'A24':'Breaker de entrada del conversor A.','B24':'Breaker de entrada del conversor B.'}[m[1]]) },
  { re:/^H(\d+):([A-D]?\d[A-D]?)$/i, cls:'c-ref', kind:'Referencia cruzada',
    fn:m=>'El cable continúa en la hoja '+m[1]+', cuadrante '+m[2].toUpperCase()+'. Verificar que esa hoja exista en el set.' },

  { re:/^F(\d{1,2})$/i, cls:'c-port', kind:'Puerto de fibra',
    fn:m=>'Puerto de fibra F'+(+m[1])+' del switch 3U. Cada switch tiene 8 (F1–F8): una celda por puerto.' },
  { re:/^(SUP|INF)$/i, cls:'c-port', kind:'Conector',
    fn:m=>m[1].toUpperCase()==='SUP' ? 'Conector superior del par dúplex LC.' : 'Conector inferior del par dúplex LC.' },
  { re:/^P(\d{1,2})$/i, cls:'c-port', kind:'Puerto uplink',
    fn:m=>'Puerto de uplink P'+(+m[1])+'. Los switches 3U usan P1 y P2 para encadenarse entre sí.' },
  { re:/^LAN(\d)?$/i, cls:'c-port', kind:'Puerto LAN',
    fn:m=>m[1] ? ('Puerto LAN'+m[1]+' del firewall. LAN3 = red interna del ODF, LAN4 = salida al Tablero TC.') : 'Puerto LAN.' },
  { re:/^IN$/i, cls:'c-port', kind:'Puerto', fn:()=>'Entrada. Se usa en CK231.LAN.IN — la entrada de red del reloj.' },
  { re:/^POE$/i, cls:'c-port', kind:'Puerto', fn:()=>'Power over Ethernet. El reloj alimenta la antena GPS por acá.' },
  { re:/^OUT$/i, cls:'c-port', kind:'Puerto', fn:()=>'Salida. Se usa en CK231.POE.OUT — la salida hacia la antena.' },
  { re:/^GPS$/i, cls:'c-eq', kind:'Equipo', fn:()=>'Antena GPS, montada en el techo de la estación.' },
  { re:/^(\d{1,2}X)$/i, cls:'c-port', kind:'Puerto',
    fn:m=>'Puerto '+m[1].toUpperCase()+' del switch central.' },
  { re:/^\d{1,2}$/, cls:'c-port', kind:'Puerto',
    fn:m=>'Puerto número '+m[0]+' del equipo anterior.' },

  { re:/^([AB])[_]?([12456])$/i, cls:'c-pos', kind:'Posición en casete',
    fn:m=>'Lado '+m[1].toUpperCase()+', posición '+m[2]+' del casete. Una de las dos fibras del canal '+m[1].toUpperCase()+'.' },
  { re:/^R[34]$/i, cls:'c-pos', kind:'Posición en casete',
    fn:()=>'Posición de reserva del casete. No se conecta.' },
  { re:/^(\d{1,3})C(\d{2})$/i, cls:'c-cell', kind:'Celda',
    fn:m=>'Celda '+(+m[2])+' de '+m[1]+' kV. En el acrílico del casete va como '+m[1]+'/C'+m[2]+'.' },
  { re:/^(\d{1,3})\.(\d{2})$/, cls:'c-cell', kind:'Celda (forma antigua)',
    fn:m=>'Celda '+(+m[2])+' de '+m[1]+' kV, escrita a la vieja usanza. La norma pide '+m[1]+'C'+m[2]+'.' },

  { re:/^([+-])(24|12)V(?:CC|DC)$/i, cls:'c-pwr', kind:'Bus de continua',
    fn:m=>'Bus '+(m[1]==='+'?'positivo':'negativo')+' de '+m[2]+' Vcc.'+(m[2]==='12'?' Solo alimenta el firewall.':'') },
  { re:/^GND$/i, cls:'c-pwr', kind:'Tierra', fn:()=>'Bus de tierra. Todos los equipos conectan su GND acá.' },
  { re:/^2[23]0V(?:AC|CA)$/i, cls:'c-pwr', kind:'Bus de alterna',
    fn:()=>'Bus de corriente alterna. Alimenta el conversor y el PDU.' },
  { re:/^[+-]$/, cls:'c-pwr', kind:'Polaridad',
    fn:m=>'Borne '+(m[0]==='+'?'positivo':'negativo')+' del equipo.' },
  { re:/^(F|N|L|T|S)$/i, cls:'c-pwr', kind:'Terminal AC',
    fn:m=>({F:'Fase.',N:'Neutro.',L:'Línea (fase).',T:'Polo T de la alimentación trifásica.',S:'Polo S de la alimentación trifásica.'}[m[1].toUpperCase()]) },
  { re:/^TL$/i, cls:'c-pwr', kind:'Circuito', fn:()=>'Telealimentación — circuito de alimentación remota al campo.' },
  { re:/^CC$/i, cls:'c-pwr', kind:'Circuito', fn:()=>'Corriente Continua.' },
  { re:/^ALO$/i, cls:'c-pwr', kind:'Circuito', fn:()=>'Nombre del circuito de alimentación local.' },
  { re:/^F[AB]24$/i, cls:'c-pwr', kind:'Feed',
    fn:m=>'Feed '+m[0][1].toUpperCase()+' de 24 Vcc. El feed B solo existe donde hay conversor redundante.' },
  { re:/^RTU\d*$/i, cls:'c-eq', kind:'Equipo',
    fn:()=>'Remote Terminal Unit. Adquiere señales de los relés de protección del campo.' },
  { re:/^SW\.TC$/i, cls:'c-eq', kind:'Equipo',
    fn:()=>'Switch del Tablero de Comunicaciones. Está fuera del ODF — es la salida hacia el SCADA.' },
];

const SAMPLES = [
  'SW211.F4.SUP/15C04.A1',
  'SW210.4/FW240.LAN3',
  'CK231.POE.OUT/GPS',
  '+24Vcc/SW211.+24VCC',
  'FW240.LAN4/SW.TC.P18',
  'SW221.F3.INF/15C03.B5',
  'H7:B2',
  'SW211.F4.SUP/60.04.A2',
];

const QUIZ = [
  { q:'¿Qué tensión usa el firewall FW240?',
    o:['24 Vcc, como todo el resto','12 Vcc','220 Vac directo','48 Vcc por POE'], a:1,
    why:'El FortiGate Rugged 30D es el único equipo del ODF que corre a 12 Vcc. Todos los demás — SW210, los switches 3U, el reloj — van a 24 Vcc. Por eso el distribuidor tiene un bus +12VCC y -12VCC aparte.' },

  { q:'En <code>SW223Esxxxx</code>, ¿qué significa el 223?',
    o:['El modelo del switch','El número de celda que conecta','El último octeto de su dirección IP','La cantidad de puertos'], a:2,
    why:'La norma dice SWyyyEsxxxx donde yyy es el último octeto de la IP del switch. Como 223 está en el rango 221–230, además sabemos que es un switch del lado B del bastidor.' },

  { q:'El cable entre el Switch Central y el Firewall. ¿Cómo se rotula el extremo que va enchufado al Firewall?',
    o:['SW210.4 / FW240.LAN3','FW240.LAN3 / SW210.4','FW240 / SW210','LAN3 / Puerto 4'], a:1,
    why:'Criterio origen/destino: parado frente al equipo, lo primero que se lee es ese equipo. En el extremo del firewall arranca con FW240; en el extremo del switch arranca con SW210. El mismo cable, dos etiquetas espejadas.' },

  { q:'¿Qué es <code>15C04</code>?',
    o:['El switch 4 de la estación 15','La celda 04 de 15 kV','El casete 15, puerto 4','El cable 15 metros, canal 4'], a:1,
    why:'Tensión + número de celda. En el acrílico físico del casete se escribe con barra (15/C04) y en la etiqueta del patchcord sin barra (15C04). Los planos viejos lo escriben 15.04.' },

  { q:'En <code>SW211.F4.SUP</code>, ¿qué es SUP?',
    o:['El bastidor superior del ODF','El conector superior del par dúplex LC','Un switch de respaldo','La celda superior del campo'], a:1,
    why:'Cada puerto de fibra Fxx tiene dos conectores: SUP (arriba) e INF (abajo). Son las dos fibras del par dúplex. Sin ese dato no se puede distinguir un patchcord del otro en el plano.' },

  { q:'¿Cuántas celdas puede atender un switch 3U?',
    o:['4','8','16','Depende de la estación'], a:1,
    why:'Ocho: los puertos F1 a F8, una celda por puerto. Si la estación tiene más celdas, se agrega otro switch 3U con la IP siguiente. Una estación chica puede tener solo dos switches (un par); una grande y redundante puede tener seis o más.' },

  { q:'Encontrás la etiqueta <code>H7:B2</code> en la hoja 6 de un set de 14 hojas. ¿Qué hacés?',
    o:['Nada, es válida: la hoja 7 existe','Verificar que el cable realmente termine en la hoja 7 cuadrante B2','Cambiarla a H6:B2','Borrarla siempre'], a:1,
    why:'Que la hoja exista no alcanza. La referencia es válida solo si el otro extremo del cable está realmente ahí y la hoja destino tiene la etiqueta apuntando de vuelta. Si la hoja 7 de ese set en particular no contiene el circuito, la referencia hay que borrarla o corregirla.' },

  { q:'¿Qué protege el breaker Q24?',
    o:['La entrada de alterna al tablero','El bus de corriente continua de 24 Vcc','El firewall','La antena GPS'], a:1,
    why:'Q220 protege la alterna (40 A); Q24 protege el bus de continua que sale del conversor (10 A). QA24 y QB24 protegen la entrada de cada conversor.' },

  { q:'¿A dónde va el puerto LAN4 del firewall?',
    o:['Al Switch Central SW210','Al reloj GPS','Al Switch del Tablero TC — la salida al SCADA','A las celdas por fibra'], a:2,
    why:'El firewall tiene una pata adentro y una afuera. LAN3 va al SW210 (red interna del ODF). LAN4 va al puerto 18 del switch del Tablero de Comunicaciones, que es por donde la subestación se conecta al sistema de monitoreo remoto.' },

  { q:'En la vista posterior de bastidores, ¿de qué lado aparece el SW221?',
    o:['A la izquierda','A la derecha','En el centro','No aparece en vista posterior'], a:0,
    why:'Truco clásico. En vista frontal el SW211 (lado A) está a la izquierda y el SW221 (lado B) a la derecha. Vistos desde atrás la imagen se espeja: el 221 pasa a la izquierda. Es uno de los errores más comunes al dibujar la hoja de conexión de red.' },

  { q:'¿Qué significa <code>TL.CC.ALO.FA24</code>?',
    o:['Un cable de fibra a la celda 24','Telealimentación de corriente continua, feed A de 24 Vcc','Un puerto del switch 3U','El conversor A del tablero'], a:1,
    why:'TL = Telealimentación, CC = Corriente Continua, ALO = nombre del circuito de alimentación local, FA24 = Feed A de 24 Vcc. Es alimentación que sale del ODF hacia el campo, no datos.' },

  { q:'Estás adaptando un plano maestro más grande y redundante a una estación más chica. ¿Cuál es el riesgo principal?',
    o:['Que falten capas en el DWG','Que queden referencias cruzadas y equipos que en la estación nueva no existen','Que no se pueda plotear','Que cambien las escalas'], a:1,
    why:'Es la causa más común de errores en revisión: hojas del maestro que no están en el set nuevo, un segundo conversor que no existe, switches con el número equivocado. Al adaptar hay que barrer todo lo que sobró.' },
];

/* ═══════════════ NAV ═══════════════ */
const nav = document.getElementById('nav');
SECTIONS.forEach(([id,label],i)=>{
  const b=document.createElement('button');
  b.textContent=label; b.dataset.target=id;
  if(i===0) b.classList.add('on');
  b.onclick=()=>{
    document.querySelectorAll('#nav button').forEach(x=>x.classList.remove('on'));
    document.querySelectorAll('section').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    document.getElementById(id).classList.add('on');
    window.scrollTo({top:0,behavior:'smooth'});
  };
  nav.appendChild(b);
});

/* ═══════════════ EQUIPO CARDS ═══════════════ */
document.getElementById('eqcards').innerHTML = EQUIPOS.map(e=>`
  <div class="card">
    <div class="tag">${e.tag}</div>
    <div class="role">${e.role}</div>
    <div class="d">${e.d}</div>
    <div class="v">${e.v}</div>
  </div>`).join('');

/* ═══════════════ DECODER ═══════════════ */
const input = document.getElementById('dinput');
const dout  = document.getElementById('dout');

document.getElementById('samples').innerHTML =
  SAMPLES.map(s=>`<button data-s="${s}">${s}</button>`).join('');
document.getElementById('samples').onclick = e=>{
  if(e.target.dataset.s){ input.value = e.target.dataset.s; decode(); }
};

function classify(tok){
  for(const r of RULES){
    const m = tok.match(r.re);
    if(m) return { tok, cls:r.cls, kind:r.kind, desc:r.fn(m) };
  }
  return { tok, cls:'c-unk', kind:'Sin reconocer', desc:'No coincide con ninguna regla de la norma. Puede ser un error de tipeo o un identificador propio de la estación.' };
}

function esc(s){ return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

function decode(){
  const raw = input.value.trim();
  if(!raw){ dout.innerHTML=''; return; }

  const parts = raw.split('/').map(s=>s.trim()).filter(Boolean);
  let html = '';
  let allKnown = true;
  const seenCell = [];

  parts.forEach((part,pi)=>{
    // split on dots, but keep +24VCC / -24VCC style tokens intact
    const toks = part.split('.').map(t=>t.trim()).filter(Boolean);
    const parsed = toks.map(classify);
    parsed.forEach(p=>{
      if(p.cls==='c-unk') allKnown=false;
      if(p.kind.startsWith('Celda')) seenCell.push(p);
    });

    const chips = parsed.map((p,i)=>
      (i? '<span class="sep">.</span>':'') +
      `<span class="chip ${p.cls}">${esc(p.tok)}</span>`
    ).join('');

    const legend = parsed.map(p=>
      `<li><span class="k ${p.cls.replace('c-','t-')}">${esc(p.tok)}</span>
           <span class="v"><b style="color:var(--ink)">${p.kind}.</b> ${p.desc}</span></li>`
    ).join('');

    const head = parts.length>1
      ? (pi===0 ? 'Extremo donde está pegada la etiqueta — origen'
                : 'Otro extremo del cable — destino')
      : 'Identificador';

    html += `<div class="endpoint">
      <div class="ep-head">${head}</div>
      <div class="chips">${chips}</div>
      <ul class="legend">${legend}</ul>
    </div>`;
  });

  // verdict
  let v='', vc='v-ok';
  const oldCell = seenCell.find(c=>c.kind.includes('antigua'));
  if(oldCell){
    vc='v-bad';
    v = `<b>Forma antigua.</b> El identificador de celda <code>${esc(oldCell.tok)}</code> usa punto. La norma 4.5 pide la forma sin punto (${esc(oldCell.tok.replace('.','C'))}). Confirmar con el cliente qué forma rige en los planos antes de cambiarlo en masa.`;
  } else if(!allKnown){
    vc='v-bad';
    v = `<b>Hay tokens sin reconocer.</b> Revisá los marcados en gris: o son un error de tipeo, o son identificadores propios de esta estación que no están en la norma.`;
  } else if(parts.length===1 && !raw.match(/^H\d+:/i)){
    v = `<b>Identificador válido.</b> Si esto es un cable y no un equipo, le falta el otro extremo: la norma pide el formato origen/destino con barra.`;
    vc='v-bad';
  } else if(parts.length>=2){
    v = `<b>Etiqueta bien formada.</b> Cumple el criterio origen/destino. Acordate de rotular el otro extremo del cable con el orden invertido: <code>${esc(parts.slice().reverse().join(' / '))}</code>`;
  } else {
    v = `<b>Referencia cruzada.</b> Antes de darla por buena, verificá que la hoja exista en este set y que el cable realmente termine en ese cuadrante.`;
  }
  html += `<div class="verdict ${vc}">${v}</div>`;

  dout.innerHTML = html;
}

input.addEventListener('input', decode);
decode();

/* ═══════════════ QUIZ ═══════════════ */
let qi = 0, score = 0, answered = false;
const qzone  = document.getElementById('qzone');
const qprog  = document.getElementById('qprog');
const qscore = document.getElementById('qscore');

function renderQ(){
  if(qi >= QUIZ.length){
    const pct = Math.round(score/QUIZ.length*100);
    let verdict;
    if(pct===100)      verdict = 'Sin errores. Podés dibujar estos planos sin mirar la norma.';
    else if(pct>=75)   verdict = 'Sólido. Repasá las que fallaste y ya está.';
    else if(pct>=50)   verdict = 'Vas bien pero todavía se te escapan cosas que el cliente va a marcar en revisión.';
    else               verdict = 'Volvé a las secciones de Cables y Celdas antes de tocar el DWG.';
    qzone.innerHTML = `
      <div class="qcard">
        <div class="qnum">Resultado</div>
        <div class="qtext">${score} de ${QUIZ.length} correctas — ${pct}%</div>
        <p style="color:var(--ink-dim)">${verdict}</p>
        <button class="btn" id="again">Empezar de nuevo</button>
      </div>`;
    document.getElementById('again').onclick = ()=>{ qi=0; score=0; update(); renderQ(); };
    return;
  }

  const q = QUIZ[qi];
  answered = false;
  qzone.innerHTML = `
    <div class="qcard">
      <div class="qnum">Pregunta ${qi+1} de ${QUIZ.length}</div>
      <div class="qtext">${q.q}</div>
      <div class="opts">
        ${q.o.map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join('')}
      </div>
      <div id="why"></div>
    </div>`;

  qzone.querySelectorAll('.opt').forEach(btn=>{
    btn.onclick = ()=>{
      if(answered) return;
      answered = true;
      const pick = +btn.dataset.i;
      const opts = qzone.querySelectorAll('.opt');
      opts.forEach((b,i)=>{
        b.disabled = true;
        if(i === q.a) b.classList.add('right');
        else if(i === pick) b.classList.add('wrong');
      });
      if(pick === q.a) score++;
      update();
      document.getElementById('why').innerHTML =
        `<div class="why">${q.why}</div>
         <button class="btn" id="next">${qi === QUIZ.length-1 ? 'Ver resultado' : 'Siguiente'}</button>`;
      document.getElementById('next').onclick = ()=>{ qi++; update(); renderQ(); };
    };
  });
}
function update(){
  qprog.textContent  = `${Math.min(qi, QUIZ.length)} / ${QUIZ.length}`;
  qscore.textContent = score;
}
update();
renderQ();
