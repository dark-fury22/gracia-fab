import "./EditorialQuote.css";

function EditorialQuote() {
  return (
    <section className="editorial-quote-section" aria-label="Customer Quote">
      <div className="editorial-quote-inner">
        <span className="editorial-quote-mark">“</span>
        <blockquote className="editorial-quote-text">
          The hair is effortless to style, holds volume all day through Lagos heat, and doesn't tangle. The AI skincare match gave me an undeniable glow from week one.
        </blockquote>
        <div className="editorial-quote-attribution">
          <span className="attribution-author">— Folashade Adeleke</span>
          <span className="attribution-tag">Verified VIP Customer · Lagos, Nigeria</span>
        </div>
      </div>
    </section>
  );
}

export default EditorialQuote;
