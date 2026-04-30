import {Dex} from '@pkmn/dex';

type QuizTarget = { types: string[]; sample: string; sampleNum: number };

const generationSelect = document.querySelector<HTMLSelectElement>('#generation')!;
const hints = document.querySelector<HTMLDivElement>('#hints')!;
const result = document.querySelector<HTMLDivElement>('#result')!;
const typeForm = document.querySelector<HTMLFormElement>('#guess-form')!;
const pokemonForm = document.querySelector<HTMLFormElement>('#pokemon-form')!;
const primary = document.querySelector<HTMLSelectElement>('#primary')!;
const secondary = document.querySelector<HTMLSelectElement>('#secondary')!;
const pokemonInput = document.querySelector<HTMLInputElement>('#pokemon')!;
const nextButton = document.querySelector<HTMLButtonElement>('#next')!;

let currentDex = Dex.forGen(9);
let typeNames: string[] = [];
let current: QuizTarget;

function spriteUrl(speciesNum: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesNum}.png`;
}

function refreshTypes() {
  typeNames = currentDex.types.all().filter(t => t.exists && !t.isNonstandard).map(t => t.name);
  primary.innerHTML = typeNames.map(t => `<option value="${t}">${t}</option>`).join('');
  secondary.innerHTML = `<option value="">None</option>${typeNames.map(t => `<option value="${t}">${t}</option>`).join('')}`;
}

function buildTargetPool() {
  return currentDex.species.all().filter(s => s.exists && !s.isNonstandard && s.types.length <= 2 && s.num > 0);
}

function randomTarget(): QuizTarget {
  const pokemonPool = buildTargetPool();
  const sample = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  return {types: sample.types, sample: sample.name, sampleNum: sample.num};
}

function defensiveProfile(types: string[]) {
  const weak: string[] = [];
  const resist: string[] = [];
  const immune: string[] = [];

  for (const atk of typeNames) {
    const isImmune = !types.every(def => currentDex.getImmunity(atk, def));
    if (isImmune) {
      immune.push(atk);
      continue;
    }
    const eff = currentDex.getEffectiveness(atk, types);
    if (eff > 0) weak.push(atk);
    else if (eff < 0) resist.push(atk);
  }
  return {weak, resist, immune};
}

function badgeList(values: string[]) {
  if (!values.length) return '<span class="chip muted">None</span>';
  return values.map(t => `<span class="chip">${t}</span>`).join('');
}

function renderHints() {
  const {weak, resist, immune} = defensiveProfile(current.types);
  hints.innerHTML = `
    <h2>Matchup clues</h2>
    <p><strong>Weak to:</strong> ${badgeList(weak)}</p>
    <p><strong>Resists:</strong> ${badgeList(resist)}</p>
    <p><strong>Immune to:</strong> ${badgeList(immune)}</p>
  `;
}

function normalizeGuess(a: string, b: string) {
  return [a, b].filter(Boolean).sort().join('/');
}

function newQuestion() {
  current = randomTarget();
  pokemonInput.value = '';
  result.innerHTML = '<em>Make your type guess first.</em>';
  renderHints();
}

function revealTypeResult(correct: boolean, answer: string) {
  result.innerHTML = `
    <p class="${correct ? 'correct' : 'wrong'}">${correct ? 'Correct typing!' : 'Not quite.'}</p>
    <p>Answer: <strong>${answer}</strong></p>
    <p>Sample Pokémon: <strong>${current.sample}</strong></p>
    <img class="sprite" src="${spriteUrl(current.sampleNum)}" alt="${current.sample}" />
    <p class="small">Bonus challenge: guess any Pokémon with the same typing below.</p>
  `;
}

function setupGenerations() {
  generationSelect.innerHTML = Array.from({length: 9}, (_, i) => 9 - i)
    .map(gen => `<option value="${gen}">Gen ${gen}</option>`)
    .join('');
}

typeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const guessed = normalizeGuess(primary.value, secondary.value);
  const target = normalizeGuess(current.types[0], current.types[1] ?? '');
  revealTypeResult(guessed === target, target);
});

pokemonForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = pokemonInput.value.trim();
  if (!raw) return;
  const species = currentDex.species.get(raw);
  const pokemonTyping = normalizeGuess(species.types[0] ?? '', species.types[1] ?? '');
  const answerTyping = normalizeGuess(current.types[0], current.types[1] ?? '');
  const msg = pokemonTyping === answerTyping
    ? `<p class="correct"><strong>${species.name}</strong> matches this typing 🎉</p>`
    : `<p class="wrong"><strong>${species.name}</strong> is ${pokemonTyping || 'unknown'}, not ${answerTyping}.</p>`;
  result.insertAdjacentHTML('beforeend', msg);
});

generationSelect.addEventListener('change', () => {
  currentDex = Dex.forGen(Number(generationSelect.value));
  refreshTypes();
  newQuestion();
});

setupGenerations();
refreshTypes();
newQuestion();
