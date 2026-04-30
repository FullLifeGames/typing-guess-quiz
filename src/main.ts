import {Dex} from '@pkmn/dex';

type QuizTarget = { types: string[]; sample: string };

const dex = Dex;
const typeNames = dex.types.all().filter(t => !t.isNonstandard).map(t => t.name);

const hints = document.querySelector<HTMLDivElement>('#hints')!;
const result = document.querySelector<HTMLDivElement>('#result')!;
const form = document.querySelector<HTMLFormElement>('#guess-form')!;
const primary = document.querySelector<HTMLSelectElement>('#primary')!;
const secondary = document.querySelector<HTMLSelectElement>('#secondary')!;
const nextButton = document.querySelector<HTMLButtonElement>('#next')!;

let current: QuizTarget;

function fillSelects() {
  primary.innerHTML = typeNames.map(t => `<option value="${t}">${t}</option>`).join('');
  secondary.innerHTML = `<option value="">None</option>${typeNames.map(t => `<option value="${t}">${t}</option>`).join('')}`;
}

function randomTarget(): QuizTarget {
  const pokemonPool = dex.species.all().filter(s => s.exists && !s.isNonstandard && s.types.length <= 2);
  const sample = pokemonPool[Math.floor(Math.random() * pokemonPool.length)];
  return {types: sample.types, sample: sample.name};
}

function defensiveProfile(types: string[]) {
  const weak: string[] = [];
  const resist: string[] = [];
  const immune: string[] = [];

  for (const atk of typeNames) {
    const isImmune = !types.every(def => dex.getImmunity(atk, def));
    if (isImmune) {
      immune.push(atk);
      continue;
    }
    const eff = dex.getEffectiveness(atk, types);
    if (eff > 0) weak.push(atk);
    else if (eff < 0) resist.push(atk);
  }
  return {weak, resist, immune};
}

function renderHints() {
  const {weak, resist, immune} = defensiveProfile(current.types);
  hints.innerHTML = `
    <h2>Type matchup hints</h2>
    <strong>Weak to</strong>
    <ul>${weak.map(t => `<li>${t}</li>`).join('')}</ul>
    <strong>Resists</strong>
    <ul>${resist.map(t => `<li>${t}</li>`).join('')}</ul>
    <strong>Immune to</strong>
    <ul>${immune.length ? immune.map(t => `<li>${t}</li>`).join('') : '<li>None</li>'}</ul>
  `;
}

function normalizeGuess(a: string, b: string) {
  return [a, b].filter(Boolean).sort().join('/');
}

function newQuestion() {
  current = randomTarget();
  result.innerHTML = '<em>Make a guess!</em>';
  renderHints();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const guessed = normalizeGuess(primary.value, secondary.value);
  const target = normalizeGuess(current.types[0], current.types[1] ?? '');
  const correct = guessed === target;
  result.innerHTML = `
    <p class="${correct ? 'correct' : 'wrong'}">${correct ? 'Correct!' : 'Not quite.'}</p>
    <p>Answer: <strong>${target}</strong></p>
    <p>Sample Pokémon for this typing: <strong>${current.sample}</strong></p>
    <p>Future extension: use @pkmn/img to render species sprites and add a "guess the Pokémon" mode.</p>
  `;
});

nextButton.addEventListener('click', newQuestion);

fillSelects();
newQuestion();
