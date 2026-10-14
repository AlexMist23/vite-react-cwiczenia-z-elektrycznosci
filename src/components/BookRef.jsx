/** Odnośnik do stron podręcznika „To jest fizyka 8” (Nowa Era). */
export default function BookRef({ pages, topics }) {
  return (
    <div className="book-ref">
      <span className="book-icon">📖</span>
      <span>
        Podręcznik „To jest fizyka 8”, <b>s. {pages}</b>
        {topics && <span className="muted"> · {topics}</span>}
      </span>
    </div>
  )
}
