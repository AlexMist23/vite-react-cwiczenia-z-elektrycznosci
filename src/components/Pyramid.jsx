/**
 * Trójkąt (piramida) wzoru. cells = [góra, ...dół], każda komórka { label, cls }.
 * Pusta etykieta wyświetla się jako „?”.
 */
export default function Pyramid({ cells, onCell }) {
  const n = cells.length - 1
  const pos = [[100, 62], ...(n === 2 ? [[68, 140], [132, 140]] : [[48, 140], [100, 140], [152, 140]])]
  return (
    <svg viewBox="0 0 200 180" className="triangle">
      <polygon points="100,8 194,174 6,174" className="tri-shape" />
      <line x1="53" y1="95" x2="147" y2="95" className="tri-line" />
      {n === 2 && <line x1="100" y1="95" x2="100" y2="174" className="tri-line" />}
      {n === 3 && (
        <>
          <line x1="76" y1="95" x2="76" y2="174" className="tri-line" />
          <line x1="124" y1="95" x2="124" y2="174" className="tri-line" />
        </>
      )}
      {cells.map(({ label, cls = '' }, i) => {
        const [x, y] = pos[i]
        return (
          <g
            key={i}
            className={`tri-cell ${label ? '' : 'empty'} ${cls}`}
            onClick={() => onCell?.(i)}
            role="button"
            aria-label={label ? `Pole ${label}` : 'Puste pole'}
          >
            <circle cx={x} cy={y} r="24" className="tri-hit" />
            <text x={x} y={y + 11} textAnchor="middle" className="tri-letter">
              {label || '?'}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
