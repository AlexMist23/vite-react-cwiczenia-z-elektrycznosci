// Symbole elementów obwodu (polska norma szkolna). Każdy symbol mieści się
// w polu 80×40, a przewody dochodzą do środka lewej i prawej krawędzi (y = 20).

const lead = (x1, x2) => <line x1={x1} y1="20" x2={x2} y2="20" />

function Meter({ letter }) {
  return (
    <>
      {lead(0, 26)}
      <circle cx="40" cy="20" r="14" fill="var(--panel)" />
      <text x="40" y="25.5" textAnchor="middle" className="sym-letter">
        {letter}
      </text>
      {lead(54, 80)}
    </>
  )
}

export const SYMBOLS = {
  cell: {
    name: 'Ogniwo (źródło napięcia)',
    hint: 'Dłuższa, cienka kreska to biegun dodatni (+), krótsza i grubsza to ujemny (−).',
    draw: () => (
      <>
        {lead(0, 35)}
        <line x1="35" y1="4" x2="35" y2="36" />
        <line x1="45" y1="12" x2="45" y2="28" strokeWidth="6" />
        {lead(45, 80)}
        <text x="27" y="10" className="sym-pm">+</text>
        <text x="51" y="10" className="sym-pm">−</text>
      </>
    ),
  },
  battery: {
    name: 'Bateria (kilka ogniw)',
    hint: 'Kilka ogniw połączonych jedno za drugim.',
    draw: () => (
      <>
        {lead(0, 24)}
        <line x1="24" y1="4" x2="24" y2="36" />
        <line x1="32" y1="12" x2="32" y2="28" strokeWidth="6" />
        <line x1="32" y1="20" x2="48" y2="20" strokeDasharray="2 3" />
        <line x1="48" y1="4" x2="48" y2="36" />
        <line x1="56" y1="12" x2="56" y2="28" strokeWidth="6" />
        {lead(56, 80)}
      </>
    ),
  },
  bulb: {
    name: 'Żarówka',
    hint: 'Kółko z krzyżykiem w środku.',
    draw: () => (
      <>
        {lead(0, 26)}
        <circle cx="40" cy="20" r="14" fill="var(--panel)" />
        <line x1="30.1" y1="10.1" x2="49.9" y2="29.9" />
        <line x1="49.9" y1="10.1" x2="30.1" y2="29.9" />
        {lead(54, 80)}
      </>
    ),
  },
  switchOpen: {
    name: 'Wyłącznik otwarty',
    hint: 'Przerwa w obwodzie – prąd nie płynie.',
    draw: () => (
      <>
        {lead(0, 24)}
        <circle cx="24" cy="20" r="2.5" fill="currentColor" />
        <line x1="24" y1="20" x2="54" y2="4" />
        <circle cx="56" cy="20" r="2.5" fill="currentColor" />
        {lead(56, 80)}
      </>
    ),
  },
  switchClosed: {
    name: 'Wyłącznik zamknięty',
    hint: 'Obwód zamknięty – prąd może płynąć.',
    draw: () => (
      <>
        {lead(0, 24)}
        <circle cx="24" cy="20" r="2.5" fill="currentColor" />
        <line x1="24" y1="20" x2="56" y2="18" />
        <circle cx="56" cy="20" r="2.5" fill="currentColor" />
        {lead(56, 80)}
      </>
    ),
  },
  resistor: {
    name: 'Opornik',
    hint: 'Prostokąt na przewodzie.',
    draw: () => (
      <>
        {lead(0, 22)}
        <rect x="22" y="12" width="36" height="16" fill="var(--panel)" />
        {lead(58, 80)}
      </>
    ),
  },
  ammeter: {
    name: 'Amperomierz',
    hint: 'Mierzy natężenie prądu; łączymy go szeregowo.',
    draw: () => <Meter letter="A" />,
  },
  voltmeter: {
    name: 'Woltomierz',
    hint: 'Mierzy napięcie; łączymy go równolegle.',
    draw: () => <Meter letter="V" />,
  },
  motor: {
    name: 'Silnik elektryczny',
    hint: 'Kółko z literą M.',
    draw: () => <Meter letter="M" />,
  },
  wire: {
    name: 'Przewód elektryczny',
    hint: 'Zwykła linia łącząca elementy.',
    draw: () => lead(0, 80),
  },
  junction: {
    name: 'Połączenie przewodów',
    hint: 'Kropka oznacza, że przewody są ze sobą połączone.',
    draw: () => (
      <>
        {lead(0, 80)}
        <line x1="40" y1="20" x2="40" y2="40" />
        <circle cx="40" cy="20" r="3.5" fill="currentColor" />
      </>
    ),
  },
}

export function Symbol({ type, x = 0, y = 0, rotate = 0, className = '' }) {
  const s = SYMBOLS[type]
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate} 40 20)`}
      className={`sym ${className}`}
    >
      {s.draw()}
    </g>
  )
}

/** Pojedynczy symbol jako samodzielny obrazek. */
export function SymbolIcon({ type, size = 120 }) {
  return (
    <svg viewBox="-4 -4 88 48" width={size} height={(size * 48) / 88} aria-label={SYMBOLS[type].name}>
      <Symbol type={type} />
    </svg>
  )
}
