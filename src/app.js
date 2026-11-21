const $ = (id) => document.getElementById(id);

const etapas = [
  ['quality', 'Qualidade', 'Lint e testes automatizados'],
  ['secrets', 'Segredos', 'Gitleaks varre o histórico'],
  ['sast', 'Código', 'CodeQL analisa o código-fonte'],
  ['deps', 'Dependências', 'Trivy busca vulnerabilidades'],
];

async function carregar() {
  try {
    const r = await fetch('version.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return { sha: 'local', short: 'local', build: '-', branch: 'local', env: 'local', actor: '-', builtAt: null, gates: {} };
  }
}

function card(nome, detalhe, estado) {
  const li = document.createElement('li');
  li.className = estado;
  const b = document.createElement('b');
  b.textContent = nome;
  const s = document.createElement('small');
  s.textContent = detalhe;
  const e = document.createElement('em');
  e.textContent = estado === 'ok' ? 'Aprovado' : estado === 'fail' ? 'Falhou' : 'Sem dados';
  li.append(b, s, e);
  return li;
}

function haQuanto(iso) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  if (min < 60) return rtf.format(-min, 'minute');
  if (min < 1440) return rtf.format(-Math.round(min / 60), 'hour');
  return rtf.format(-Math.round(min / 1440), 'day');
}

async function iniciar() {
  const v = await carregar();
  const noAr = v.env !== 'local';
  const lista = $('gates');
  lista.replaceChildren();

  let todosOk = true;
  for (const [chave, nome, detalhe] of etapas) {
    const r = v.gates[chave];
    const estado = r === 'success' ? 'ok' : r ? 'fail' : '';
    if (estado !== 'ok') todosOk = false;
    lista.append(card(nome, detalhe, estado));
  }
  lista.append(card('Deploy', noAr ? 'Cloudflare Pages (' + v.env + ')' : 'Ocorre só na pipeline', noAr ? 'ok' : ''));

  $('sha').textContent = v.short;
  $('status').textContent = noAr && todosOk ? 'No ar, todos os gates aprovados' : noAr ? 'No ar' : 'Build local';
  $('badge').classList.toggle('ok', noAr && todosOk);

  const quando = v.builtAt ? new Date(v.builtAt).toLocaleString('pt-BR') + ' (' + haQuanto(v.builtAt) + ')' : '-';
  const linhas = [['commit', v.short], ['build', '#' + v.build], ['branch', v.branch], ['ambiente', v.env], ['autor', v.actor], ['publicado', quando]];
  const dl = $('release');
  dl.replaceChildren();
  for (const [k, val] of linhas) {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = val;
    row.append(dt, dd);
    dl.append(row);
  }
}

iniciar();
