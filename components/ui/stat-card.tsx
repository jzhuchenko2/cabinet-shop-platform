export function StatCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <section className="card">
      <p className="muted">{label}</p>
      <div className="metric">{value}</div>
      {detail ? <p className="muted">{detail}</p> : null}
    </section>
  );
}

