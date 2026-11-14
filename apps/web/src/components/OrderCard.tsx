import {formatDate, formatPaise} from "@/lib/format";
import {statusLabel} from "@/modules/orders/order-timeline";
import type {OrderView} from "@/modules/orders/orders.service";

export function OrderCard({order: o}: {order: OrderView}) {
  const current = o.timeline.steps.find(s => s.state === "current")?.label ?? statusLabel(o.status);
  return <article className="order-card" aria-label={`Order ${o.publicId}`}>
    <header>
      <div><p className="eyebrow">ORDER {o.publicId}{o.sample ? " · SAMPLE (DEMO)" : ""}</p><h2>{o.timeline.offPath ? o.timeline.offPath.label : current}</h2></div>
      <div className="order-total"><b>{formatPaise(o.totalPaise)}</b><small>Placed {formatDate(o.createdAt)}</small></div>
    </header>
    {o.sample && <p className="notice">Sample order shown for demonstration only. It is not stored and has no payment or shipment.</p>}
    {o.status === "PAYMENT_PENDING" && <p className="notice">Payment has not been verified yet. The order is confirmed only after our payment provider confirms it.</p>}
    {o.timeline.offPath && <p className="notice" style={{borderLeftColor: "var(--rust)"}}>Status: {o.timeline.offPath.label}. Contact support if you need help with this order.</p>}
    <ol className="timeline" aria-label="Order progress">
      {o.timeline.steps.map(s => <li key={s.key} className={`tl-${s.state}`} aria-current={s.state === "current" ? "step" : undefined}>
        <span className="tl-dot" aria-hidden="true" /><span className="tl-label">{s.label}<span className="sr-only">{s.state === "done" ? " (completed)" : s.state === "current" ? " (current)" : " (upcoming)"}</span></span>
      </li>)}
    </ol>
    <ul className="order-lines">{o.lines.map(l => <li key={l.sku}>
      <span>{l.quantity} × {l.description}{l.size ? ` · ${l.size}` : ""}{l.colour ? ` · ${l.colour}` : ""}</span><span>{formatPaise(BigInt(l.unitPaise) * BigInt(l.quantity))}</span>
    </li>)}</ul>
    <dl className="order-meta">
      <div><dt>Incl. tax</dt><dd>{formatPaise(o.taxPaise)}</dd></div>
      <div><dt>Shipping</dt><dd>{formatPaise(o.shippingPaise)}</dd></div>
      {o.payment && <div><dt>Payment</dt><dd>{o.payment.status.replace(/_/g, " ").toLowerCase()}</dd></div>}
      {o.shippingWindow && <div><dt>Dispatch window</dt><dd>{formatDate(o.shippingWindow.from)} – {formatDate(o.shippingWindow.to)}</dd></div>}
    </dl>
  </article>;
}
