const $ = (id) => document.getElementById(id);

const etapas = [
  ['quality', 'Qualidade', 'lint e testes automatizados'],
  ['secrets', 'Segredos', 'Gitleaks procura credenciais no histórico'],
  ['sast', 'Código', 'CodeQL analisa o código-fonte'],
  ['deps', 'Dependências', 'Trivy procura vulnerabilidades conhecidas'],
];

async function carregar() {
  try {
    const r = await fetch('version.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } catch {
    return { short: 'local', build: '-', branch: 'local', env: 'local', actor: '-', builtAt: null, gates: {} };
  }
}

function etapa(nome, detalhe, estado) {
  const li = document.createElement('li');
  li.className = estado;
  const b = document.createElement('strong');
  b.textContent = nome;
  const s = document.createElement('small');
  s.textContent = detalhe;
  li.append(b, s);
  return li;
}

async function iniciar() {
  const v = await carregar();
  $('sha').textContent = v.short;
  $('build').textContent = `#${v.build}`;
  $('branch').textContent = v.branch;
  $('env').textContent = v.env;
  $('actor').textContent = v.actor;
  $('when').textContent = v.builtAt ? new Date(v.builtAt).toLocaleString('pt-BR') : '-';

  const lista = $('gates');
  lista.replaceChildren();
  for (const [chave, nome, detalhe] of etapas) {
    const r = v.gates[chave];
    const estado = r === 'success' ? 'ok' : r ? 'fail' : '';
    const texto = r === 'success' ? `${detalhe} (aprovado)` : r ? `${detalhe} (${r})` : `${detalhe} (sem dados no build local)`;
    lista.append(etapa(nome, texto, estado));
  }
  const noAr = v.env !== 'local';
  lista.append(etapa('Deploy', noAr ? `publicado no Cloudflare Pages (${v.env})` : 'ocorre só na pipeline', noAr ? 'ok' : ''));
}

iniciar();
