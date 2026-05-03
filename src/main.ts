import {Dex} from '@pkmn/dex';

type QuizTarget = { types: string[]; sample: string; sampleSpriteId: string };
type MatchupProfile = {
  veryWeak: string[];
  weak: string[];
  resist: string[];
  veryResist: string[];
  immune: string[];
  neutral: string[];
};
type Theme = 'light' | 'dark';
type PokemonOption = { name: string; num: number; spriteId: string; types: string[] };
type TypingBucket = { key: string; types: string[]; samples: PokemonOption[] };

const TYPE_COLORS: Record<string, string> = {
  Bug: '#8cb230',
  Dark: '#5b5366',
  Dragon: '#0f6ac0',
  Electric: '#f7d02c',
  Fairy: '#ec8fe6',
  Fighting: '#ce416b',
  Fire: '#ff9d55',
  Flying: '#89aae3',
  Ghost: '#5269ad',
  Grass: '#63bc5a',
  Ground: '#d97845',
  Ice: '#73cec0',
  Normal: '#919aa2',
  Poison: '#aa6bc8',
  Psychic: '#fa7179',
  Rock: '#c5b78c',
  Steel: '#5a8ea2',
  Stellar: '#37a3ff',
  Water: '#5090d6',
};

const TYPE_ICONS: Record<string, string> = {
  Bug: '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="5"/><path d="M8 9 5 6M16 9l3-3M7 14H4M17 14h3M9 19l-2 2M15 19l2 2"/></svg>',
  Dark: '<svg viewBox="0 0 24 24"><path d="M16.5 4.5a8 8 0 1 0 0 15 6.2 6.2 0 0 1 0-15Z"/></svg>',
  Dragon: '<svg viewBox="0 0 24 24"><path d="M12 3 21 12 12 21 3 12 12 3Z"/><path d="m9 10 3 6 3-6"/></svg>',
  Electric: '<svg viewBox="0 0 24 24"><path d="M13 2 5 13h6l-1 9 9-13h-6l1-7Z"/></svg>',
  Fairy: '<svg viewBox="0 0 24 24"><path d="m12 3 2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z"/></svg>',
  Fighting: '<svg viewBox="0 0 24 24"><path d="M6 10h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-5Z"/><path d="M7 10V6M11 10V5M15 10V6M18 10V7"/></svg>',
  Fire: '<svg viewBox="0 0 24 24"><path d="M12 21c-4 0-7-2.8-7-6.6 0-3.2 2.1-5.3 4.1-7.2.4 2 1.3 3.1 2.6 3.8-.2-3.4 1.5-5.9 4.4-8 0 4.1 2.9 6 2.9 10.6 0 4.3-3.1 7.4-7 7.4Z"/></svg>',
  Flying: '<svg viewBox="0 0 24 24"><path d="M3 15c7-8 13-9 18-9-2 2.5-5.2 4.4-9 5.5 3-.1 5.2.3 6.8 1.2-3 2-7 2.9-12 2.7L3 19v-4Z"/></svg>',
  Ghost: '<svg viewBox="0 0 24 24"><path d="M5 20V9a7 7 0 0 1 14 0v11l-3-2-2.7 2-2.6-2L8 20l-3-2Z"/><circle cx="10" cy="10" r="1.2"/><circle cx="15" cy="10" r="1.2"/></svg>',
  Grass: '<svg viewBox="0 0 24 24"><path d="M20 4C10 4 5 9 5 18c9 0 14-5 15-14Z"/><path d="M6 18c3-5 7-8 12-12"/></svg>',
  Ground: '<svg viewBox="0 0 24 24"><path d="M4 17h16M6 13h12M8 9h8M10 5h4"/></svg>',
  Ice: '<svg viewBox="0 0 24 24"><path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M8.5 5.1 12 7l3.5-1.9M8.5 18.9 12 17l3.5 1.9"/></svg>',
  Normal: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="7"/></svg>',
  Poison: '<svg viewBox="0 0 24 24"><circle cx="12" cy="9" r="5"/><path d="M8 15h8M9 19h6"/><circle cx="10" cy="9" r="1"/><circle cx="14" cy="9" r="1"/></svg>',
  Psychic: '<svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z"/><circle cx="12" cy="12" r="3"/></svg>',
  Rock: '<svg viewBox="0 0 24 24"><path d="m7 5 8-2 6 7-3 9-10 2-5-7 4-9Z"/></svg>',
  Steel: '<svg viewBox="0 0 24 24"><path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z"/><circle cx="12" cy="12" r="3"/></svg>',
  Stellar: '<svg viewBox="0 0 24 24"><path d="m12 2 2.1 6.8H21l-5.6 4.1 2.2 6.8-5.6-4.2-5.6 4.2 2.2-6.8L3 8.8h6.9L12 2Z"/></svg>',
  Water: '<svg viewBox="0 0 24 24"><path d="M12 3c4 4.5 6 7.8 6 11a6 6 0 0 1-12 0c0-3.2 2-6.5 6-11Z"/></svg>',
};

const generationSelect = document.querySelector<HTMLSelectElement>('#generation')!;
const hints = document.querySelector<HTMLDivElement>('#hints')!;
const result = document.querySelector<HTMLDivElement>('#result')!;
const typeForm = document.querySelector<HTMLFormElement>('#guess-form')!;
const pokemonForm = document.querySelector<HTMLFormElement>('#pokemon-form')!;
const primary = document.querySelector<HTMLSelectElement>('#primary')!;
const secondary = document.querySelector<HTMLSelectElement>('#secondary')!;
const pokemonInput = document.querySelector<HTMLInputElement>('#pokemon')!;
const pokemonOptions = document.querySelector<HTMLDivElement>('#pokemon-options')!;
const nextButton = document.querySelector<HTMLButtonElement>('#next')!;
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle')!;
const themeLabel = document.querySelector<HTMLElement>('[data-theme-label]')!;

let currentDex = Dex.forGen(9);
let typeNames: string[] = [];
let current: QuizTarget;
let pokemonPool: PokemonOption[] = [];
let typingBuckets: TypingBucket[] = [];
let activePokemonIndex = -1;
let selectedPokemonName = '';

const THEME_STORAGE_KEY = 'typing-guess-theme';
const MAX_POKEMON_OPTIONS = 12;
const SWABLU_TYPING_KEY = 'Flying/Normal';

function pokemonSpriteId(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function spriteUrl(spriteId: string) {
  return `https://play.pokemonshowdown.com/sprites/home/${spriteId}.png`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function refreshTypes() {
  typeNames = currentDex.types.all().filter(t => t.exists && !t.isNonstandard).map(t => t.name);
  primary.innerHTML = typeNames.map(t => `<option value="${t}">${t}</option>`).join('');
  secondary.innerHTML = `<option value="">None</option>${typeNames.map(t => `<option value="${t}">${t}</option>`).join('')}`;
}

function buildTargetPool() {
  return currentDex.species.all().filter(s => s.exists && !s.isNonstandard && s.types.length <= 2 && s.num > 0);
}

function canonicalTyping(types: string[]) {
  return [...types].sort().join('/');
}

function isSwabluEquivalent(types: string[]) {
  return canonicalTyping(types) === SWABLU_TYPING_KEY;
}

function refreshPools() {
  pokemonPool = buildTargetPool()
    .map(species => ({name: species.name, num: species.num, spriteId: pokemonSpriteId(species.name), types: species.types}))
    .sort((a, b) => a.num - b.num || a.name.localeCompare(b.name));

  const buckets = new Map<string, PokemonOption[]>();
  for (const pokemon of pokemonPool) {
    const key = canonicalTyping(pokemon.types);
    buckets.set(key, [...(buckets.get(key) ?? []), pokemon]);
  }

  typingBuckets = Array.from(buckets, ([key, samples]) => ({
    key,
    types: key.split('/'),
    samples: samples.sort((a, b) => a.num - b.num || a.name.localeCompare(b.name)),
  })).sort((a, b) => a.key.localeCompare(b.key));
}

function randomTarget(): QuizTarget {
  const typing = typingBuckets[Math.floor(Math.random() * typingBuckets.length)];
  const sample = typing.samples[Math.floor(Math.random() * typing.samples.length)];

  return {types: typing.types, sample: sample.name, sampleSpriteId: sample.spriteId};
}

function defensiveProfile(types: string[]): MatchupProfile {
  const veryWeak: string[] = [];
  const weak: string[] = [];
  const resist: string[] = [];
  const veryResist: string[] = [];
  const immune: string[] = [];
  const neutral: string[] = [];

  for (const atk of typeNames) {
    const isImmune = !types.every(def => currentDex.getImmunity(atk, def));
    if (isImmune) {
      immune.push(atk);
      continue;
    }

    const eff = currentDex.getEffectiveness(atk, types);
    if (eff > 1) veryWeak.push(atk);
    else if (eff > 0) weak.push(atk);
    else if (eff < -1) veryResist.push(atk);
    else if (eff < 0) resist.push(atk);
    else neutral.push(atk);
  }

  return {veryWeak, weak, resist, veryResist, immune, neutral};
}

function typeBadge(type: string) {
  const color = TYPE_COLORS[type] ?? TYPE_COLORS.Normal;
  const icon = TYPE_ICONS[type] ?? TYPE_ICONS.Normal;
  const label = escapeHtml(type);

  return `
    <span class="type-badge" data-type-badge style="--type-color: ${color}" title="${label}">
      <span class="type-icon" data-type-icon aria-hidden="true">${icon}</span>
      <span class="type-name">${label}</span>
    </span>
  `;
}

function badgeList(values: string[]) {
  if (!values.length) return '<span class="type-empty">None</span>';
  return values.map(typeBadge).join('');
}

function renderMatchupGroup(key: keyof MatchupProfile, label: string, values: string[]) {
  return `
    <section class="matchup-group" data-matchup="${key}">
      <h3>${label}</h3>
      <div class="type-list">${badgeList(values)}</div>
    </section>
  `;
}

function renderSwabluEasterEgg() {
  return isSwabluEquivalent(current.types)
    ? '<p class="easter-egg" data-easter-egg="swablu">Thanks to Cloudy!</p>'
    : '';
}

function renderHints() {
  const {veryWeak, weak, resist, veryResist, immune, neutral} = defensiveProfile(current.types);
  hints.innerHTML = `
    <div class="matchup-grid">
      ${renderMatchupGroup('veryWeak', 'Very weak to', veryWeak)}
      ${renderMatchupGroup('weak', 'Weak to', weak)}
      ${renderMatchupGroup('neutral', 'Neutral to', neutral)}
      ${renderMatchupGroup('resist', 'Resists', resist)}
      ${renderMatchupGroup('veryResist', 'Resists 4x', veryResist)}
      ${renderMatchupGroup('immune', 'Immune to', immune)}
    </div>
    ${renderSwabluEasterEgg()}
  `;
}

function normalizeGuess(a: string, b: string) {
  return [a, b].filter(Boolean).sort().join('/');
}

function normalizeSearch(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function closePokemonOptions() {
  pokemonOptions.hidden = true;
  pokemonInput.setAttribute('aria-expanded', 'false');
  pokemonInput.removeAttribute('aria-activedescendant');
  activePokemonIndex = -1;
}

function filteredPokemonOptions(query: string) {
  const normalizedQuery = normalizeSearch(query);
  const matches = normalizedQuery
    ? pokemonPool.filter(pokemon => normalizeSearch(pokemon.name).includes(normalizedQuery))
    : pokemonPool;

  return matches.slice(0, MAX_POKEMON_OPTIONS);
}

function updateActivePokemonOption() {
  const options = Array.from(pokemonOptions.querySelectorAll<HTMLElement>('[role="option"]'));

  options.forEach((option, index) => {
    const isActive = index === activePokemonIndex;
    option.setAttribute('aria-selected', String(isActive));
    if (isActive) {
      pokemonInput.setAttribute('aria-activedescendant', option.id);
    }
  });

  if (activePokemonIndex < 0) {
    pokemonInput.removeAttribute('aria-activedescendant');
  }
}

function renderPokemonOptions(query = pokemonInput.value) {
  const matches = filteredPokemonOptions(query);
  pokemonOptions.hidden = false;
  pokemonOptions.dataset.placement = 'above';
  pokemonInput.setAttribute('aria-expanded', 'true');

  if (!matches.length) {
    pokemonOptions.innerHTML = '<div class="pokemon-option empty">No matches</div>';
    activePokemonIndex = -1;
    pokemonInput.removeAttribute('aria-activedescendant');
    return;
  }

  pokemonOptions.innerHTML = matches.map((pokemon, index) => {
    const name = escapeHtml(pokemon.name);
    const types = escapeHtml(pokemon.types.join('/'));

    return `
      <button
        id="pokemon-option-${index}"
        class="pokemon-option"
        type="button"
        role="option"
        data-pokemon="${name}"
        aria-selected="${index === 0}"
      >
        <span class="pokemon-number">#${pokemon.num}</span>
        <strong>${name}</strong>
        <span class="pokemon-types">${types}</span>
      </button>
    `;
  }).join('');

  activePokemonIndex = 0;
  updateActivePokemonOption();
}

function selectPokemon(name: string) {
  selectedPokemonName = name;
  pokemonInput.value = name;
  closePokemonOptions();
}

function getStoredTheme(): Theme | undefined {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : undefined;
  } catch {
    return undefined;
  }
}

function storeTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still works for the current page when storage is unavailable.
  }
}

function applyTheme(theme: Theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
  themeToggle.title = `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`;

  if (persist) {
    storeTheme(theme);
  }
}

function setupTheme() {
  applyTheme(getStoredTheme() ?? 'dark');
}

function newQuestion() {
  current = randomTarget();
  typeForm.reset();
  pokemonForm.reset();
  selectedPokemonName = '';
  closePokemonOptions();
  result.innerHTML = '<em>Make your type guess first.</em>';
  renderHints();
}

function revealTypeResult(correct: boolean, answer: string) {
  result.innerHTML = `
    <p class="${correct ? 'correct' : 'wrong'}">${correct ? 'Correct typing!' : 'Not quite.'}</p>
    <div class="answer-line">
      <span>Answer</span>
      <strong aria-label="${escapeHtml(answer)}">${badgeList(current.types)}</strong>
    </div>
    <div class="sample-line">
      <span>Sample Pokemon</span>
      <strong>${escapeHtml(current.sample)}</strong>
    </div>
    <img class="sprite" src="${spriteUrl(current.sampleSpriteId)}" alt="${escapeHtml(current.sample)}" />
    <p class="small">Bonus: name another Pokemon with the same typing.</p>
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
  const raw = (selectedPokemonName || pokemonInput.value).trim();
  if (!raw) return;

  const species = currentDex.species.get(raw);
  const pokemonTyping = normalizeGuess(species.types[0] ?? '', species.types[1] ?? '');
  const answerTyping = normalizeGuess(current.types[0], current.types[1] ?? '');
  const msg = pokemonTyping === answerTyping
    ? `<p class="correct"><strong>${escapeHtml(species.name)}</strong> matches this typing.</p>`
    : `<p class="wrong"><strong>${escapeHtml(species.name)}</strong> is ${escapeHtml(pokemonTyping || 'unknown')}, not ${escapeHtml(answerTyping)}.</p>`;

  result.insertAdjacentHTML('beforeend', msg);
});

pokemonInput.addEventListener('focus', () => {
  renderPokemonOptions();
});

pokemonInput.addEventListener('input', () => {
  selectedPokemonName = '';
  renderPokemonOptions();
});

pokemonInput.addEventListener('keydown', (e) => {
  const options = Array.from(pokemonOptions.querySelectorAll<HTMLElement>('[role="option"]'));

  if (e.key === 'Escape') {
    closePokemonOptions();
    return;
  }

  if (!options.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (pokemonOptions.hidden) {
      renderPokemonOptions();
      return;
    }
    activePokemonIndex = (activePokemonIndex + 1) % options.length;
    updateActivePokemonOption();
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    activePokemonIndex = (activePokemonIndex - 1 + options.length) % options.length;
    updateActivePokemonOption();
  }

  if (e.key === 'Enter' && !pokemonOptions.hidden && activePokemonIndex >= 0) {
    e.preventDefault();
    const selected = options[activePokemonIndex]?.dataset.pokemon;
    if (selected) {
      selectPokemon(selected);
    }
  }
});

pokemonOptions.addEventListener('click', (e) => {
  const option = (e.target as HTMLElement).closest<HTMLElement>('[data-pokemon]');
  if (option?.dataset.pokemon) {
    selectPokemon(option.dataset.pokemon);
  }
});

document.addEventListener('click', (e) => {
  const target = e.target as Node;
  if (!pokemonInput.contains(target) && !pokemonOptions.contains(target)) {
    closePokemonOptions();
  }
});

nextButton.addEventListener('click', () => {
  newQuestion();
});

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

generationSelect.addEventListener('change', () => {
  currentDex = Dex.forGen(Number(generationSelect.value));
  refreshTypes();
  refreshPools();
  newQuestion();
});

setupTheme();
setupGenerations();
refreshTypes();
refreshPools();
newQuestion();
