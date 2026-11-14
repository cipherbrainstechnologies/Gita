"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {adminFetch, describeFailure} from "./adminFetch";
import {StatusChip} from "./StatusChip";
import {formatInr} from "@/lib/money";
import type {OrderDto} from "@/modules/admin/orders/orders.service";

function OrderRow({o, canAdvance, canRefund}: {o: OrderDto; canAdvance: boolean; canRefund: boolean}) {
  const router = useRouter();
  const [chosen, setTo] = useState("");
  const to = o.allowedTransitions.find(s => s === chosen) ?? o.allowedTransitions[0] ?? "";
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{kind: "ok" | "err"; text: string} | null>(null);
  const reasonOk = reason.trim().length >= 3;
  async function call(path: "status" | "refund", body: Record<string, unknown>, okText: string) {
    setBusy(true); setMsg(null);
    const r = await adminFetch("POST", `/api/admin/orders/${encodeURIComponent(o.id)}/${path}`, {...body, reason: reason.trim(), expectedVersion: o.version});
    if (r.ok) { setMsg({kind: "ok", text: okText}); setReason(""); router.refresh(); } else setMsg({kind: "err", text: describeFailure(r)});
    setBusy(false);
  }
  const showActions = (canAdvance && o.allowedTransitions.length > 0) || (canRefund && o.canRequestRefund);
  return <tr>
    <td><b>{o.publicId}</b><br /><small>{o.createdAt.slice(0, 16).replace("T", " ")} UTC</small></td>
    <td><StatusChip status={o.status} label={o.status.replace(/_/g, " ")} />{o.refundOpen && <><br /><small>refund request open</small></>}</td>
    <td>{o.customerEmail ?? "—"}</td>
    <td>{o.itemCount}</td>
    <td><b>{formatInr(o.totalPaise)}</b><br /><small>tax {formatInr(o.taxPaise)} · ship {formatInr(o.shippingPaise)}</small></td>
    <td>{o.paymentStatus ?? "—"}</td>
    <td>{o.shipWindow ? `${o.shipWindow.from.slice(0, 10)} → ${o.shipWindow.to.slice(0, 10)}` : "—"}</td>
    <td>{showActions ? <div className="admin-row-actions">
      <input aria-label={`Reason for ${o.publicId}`} placeholder="Reason (required, audited)" value={reason} maxLength={500} onChange={e => setReason(e.target.value)} />
      {canAdvance && o.allowedTransitions.length > 0 && <span className="admin-actions">
        <select aria-label="Next status" value={to} onChange={e => setTo(e.target.value)}>{o.allowedTransitions.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</select>
        <button type="button" className="button-outline small" disabled={busy || !reasonOk || !to} onClick={() => call("status", {to}, `Moved to ${to}.`)}>ADVANCE</button></span>}
      {canRefund && o.canRequestRefund && <button type="button" className="button-outline small" disabled={busy || !reasonOk} onClick={() => call("refund", {}, "Refund request recorded (PENDING_APPROVAL). No money has moved.")}>REQUEST REFUND</button>}
      {msg && <output className={msg.kind === "err" ? "admin-error" : "admin-ok"} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</output>}
    </div> : <small>no actions</small>}</td>
  </tr>;
}

export default function OrdersAdmin({orders, canAdvance, canRefund}: {orders: OrderDto[]; canAdvance: boolean; canRefund: boolean}) {
  if (orders.length === 0) return <p className="notice">No orders exist yet. Nothing here is sample data.</p>;
  return <div className="admin-scroll"><table className="admin-table"><thead><tr><th>ORDER</th><th>STATUS</th><th>CUSTOMER</th><th>QTY</th><th>TOTAL</th><th>PAYMENT</th><th>SHIP WINDOW</th><th>ACTIONS</th></tr></thead>
    <tbody>{orders.map(o => <OrderRow key={o.id} o={o} canAdvance={canAdvance} canRefund={canRefund} />)}</tbody></table></div>;
}
