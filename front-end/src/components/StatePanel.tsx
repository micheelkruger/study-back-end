import type { ReactNode } from 'react';

export function StatePanel({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="state-panel" role="status">
      <span className="state-panel-icon" aria-hidden="true">✳</span>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      <p>{description}</p>
      {action && <div className="state-panel-action">{action}</div>}
    </section>
  );
}
