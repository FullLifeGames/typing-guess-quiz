// @vitest-environment jsdom
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Dex} from '@pkmn/dex';

function canonicalTyping(types: string[]) {
  return [...types].sort().join('/');
}

function typeKeysForGen(gen: number) {
  const dex = Dex.forGen(gen);
  const species = dex.species.all().filter(s => s.exists && !s.isNonstandard && s.types.length <= 2 && s.num > 0);
  return Array.from(new Set(species.map(s => canonicalTyping(s.types)))).sort((a, b) => a.localeCompare(b));
}

function randomForTypeKey(typeKey: string, gen = 9) {
  const typeKeys = typeKeysForGen(gen);
  const index = typeKeys.indexOf(typeKey);
  if (index < 0) throw new Error(`Missing type key: ${typeKey}`);
  return (index + 0.01) / typeKeys.length;
}

function setAppDom() {
  document.body.innerHTML = `
    <main class="app">
      <h1>Pokemon Typing Quiz</h1>
      <p class="subtitle">Use battle matchup clues to guess a typing, then try to identify a matching Pokemon.</p>

      <section class="panel controls">
        <label for="generation">Generation Ruleset</label>
        <select id="generation"></select>
      </section>

      <section class="panel" id="hints"></section>

      <form id="guess-form" class="panel grid-form">
        <label for="primary">Primary type</label>
        <select id="primary" required></select>

        <label for="secondary">Secondary type (optional)</label>
        <select id="secondary"></select>

        <button type="submit">Submit Type Guess</button>
      </form>

      <form id="pokemon-form" class="panel grid-form">
        <label for="pokemon">Bonus Pokemon</label>
        <input
          id="pokemon"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded="false"
          aria-controls="pokemon-options"
          placeholder="Search Pokemon"
        />
        <div id="pokemon-options" role="listbox"></div>
        <button type="submit">Submit Pokemon Guess</button>
      </form>

      <section id="result" class="panel"></section>

      <div class="actions">
        <button id="next">Next Question</button>
        <button id="theme-toggle" type="button" aria-pressed="false">
          <span data-theme-label>Dark</span>
        </button>
      </div>
    </main>
  `;
}

async function loadApp() {
  vi.resetModules();
  setAppDom();
  await import('./main');
}

describe('typing quiz', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('resets the quiz when the next question button is clicked', async () => {
    await loadApp();

    document.querySelector<HTMLFormElement>('#guess-form')!.requestSubmit();
    document.querySelector<HTMLInputElement>('#pokemon')!.value = 'Gengar';
    document.querySelector<HTMLButtonElement>('#next')!.click();

    expect(document.querySelector('#result')!.textContent).toContain('Make your type guess first.');
    expect(document.querySelector('#result')!.textContent).not.toContain('Answer:');
    expect(document.querySelector<HTMLInputElement>('#pokemon')!.value).toBe('');
  });

  it('shows all defensive matchup buckets with type icon badges', async () => {
    await loadApp();

    const hints = document.querySelector('#hints')!;

    expect(hints.querySelector('[data-matchup="weak"]')).toBeTruthy();
    expect(hints.querySelector('[data-matchup="resist"]')).toBeTruthy();
    expect(hints.querySelector('[data-matchup="immune"]')).toBeTruthy();
    expect(hints.querySelector('[data-matchup="neutral"]')).toBeTruthy();
    expect(hints.querySelectorAll('[data-type-badge]').length).toBeGreaterThan(0);
    expect(hints.querySelectorAll('[data-type-icon]').length).toBeGreaterThan(0);
  });

  it('filters the bonus Pokemon search select and selects an option', async () => {
    await loadApp();

    const pokemon = document.querySelector<HTMLInputElement>('#pokemon')!;
    pokemon.value = 'geng';
    pokemon.dispatchEvent(new Event('input', {bubbles: true}));

    const gengar = Array.from(document.querySelectorAll<HTMLElement>('[role="option"]'))
      .find(option => option.textContent?.includes('Gengar'));
    expect(gengar).toBeTruthy();
    expect(document.querySelector<HTMLElement>('#pokemon-options')!.dataset.placement).toBe('above');

    gengar!.click();

    expect(pokemon.value).toBe('Gengar');
    expect(pokemon.getAttribute('aria-expanded')).toBe('false');
  });

  it('uses dark mode by default and toggles to light mode', async () => {
    await loadApp();

    const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle')!;

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-theme-label]')!.textContent).toBe('Light');

    toggle.click();

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(document.querySelector('[data-theme-label]')!.textContent).toBe('Dark');
  });

  it('draws questions from type combinations instead of weighting by Pokemon count', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.999999)
      .mockReturnValueOnce(0);
    await loadApp();

    document.querySelector<HTMLFormElement>('#guess-form')!.requestSubmit();

    const expectedTyping = typeKeysForGen(9).at(-1);
    expect(document.querySelector('.answer-line strong')!.getAttribute('aria-label')).toBe(expectedTyping);
  });

  it('uses regional form sprite ids for sample Pokemon', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(randomForTypeKey('Ice/Steel'))
      .mockReturnValueOnce(0);
    await loadApp();

    document.querySelector<HTMLFormElement>('#guess-form')!.requestSubmit();

    const result = document.querySelector('#result')!;
    expect(result.textContent).toContain('Sandshrew-Alola');
    expect(document.querySelector<HTMLImageElement>('.sprite')!.src).toContain('/sandshrew-alola.png');
  });

  it('separates 2x and 4x matchup clues', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(randomForTypeKey('Ice/Steel'))
      .mockReturnValueOnce(0);
    await loadApp();

    const veryWeak = document.querySelector<HTMLElement>('[data-matchup="veryWeak"]')!;
    const weak = document.querySelector<HTMLElement>('[data-matchup="weak"]')!;
    const veryResist = document.querySelector<HTMLElement>('[data-matchup="veryResist"]')!;
    const resist = document.querySelector<HTMLElement>('[data-matchup="resist"]')!;

    expect(veryWeak.textContent).toContain('Fire');
    expect(veryWeak.textContent).toContain('Fighting');
    expect(weak.textContent).not.toContain('Fire');
    expect(veryResist.textContent).toContain('Ice');
    expect(resist.textContent).not.toContain('Ice');
  });

  it('orders matchup clue buckets by defensive multiplier', async () => {
    await loadApp();

    const matchupOrder = Array.from(document.querySelectorAll<HTMLElement>('[data-matchup]'))
      .map(group => group.dataset.matchup);

    expect(matchupOrder).toEqual(['veryWeak', 'weak', 'neutral', 'resist', 'veryResist', 'immune']);
  });

  it('shows the Cloudy easter egg for Swablu-equivalent typings', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(randomForTypeKey('Flying/Normal'))
      .mockReturnValueOnce(0);
    await loadApp();

    const easterEgg = document.querySelector<HTMLElement>('[data-easter-egg="swablu"]');

    expect(easterEgg?.textContent).toBe('Thanks to Cloudy!');
  });
});
