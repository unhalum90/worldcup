export default function PricingTimeline() {
  return (
    <section className="container mt-6 mb-10">
      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-neutral-100)] bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold mb-2">Pricing & Launch</h3>
        <p className="text-[color:var(--color-neutral-800)] mb-4">Free access to core features until <strong>Apr 1, 2025</strong>. Presale pricing in March: <strong>$39.99</strong> — launch price: <strong>$49.99</strong>.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded bg-[color:var(--color-neutral-50)]">
            <strong>Free period</strong>
            <div className="text-sm">Sign up now for full pre-launch access.</div>
          </div>
          <div className="p-3 rounded bg-[color:var(--color-neutral-50)]">
            <strong>Presale</strong>
            <div className="text-sm">March presale: $39.99</div>
          </div>
          <div className="p-3 rounded bg-[color:var(--color-neutral-50)]">
            <strong>Launch</strong>
            <div className="text-sm">Launch price: $49.99</div>
          </div>
        </div>
      </div>
    </section>
  );
}
