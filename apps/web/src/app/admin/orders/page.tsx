import Link from "next/link";
import {gateAdmin} from "@/lib/admin";
import {AdminDenied} from "@/components/admin/AdminGate";
import OrdersAdmin from "@/components/admin/OrdersAdmin";
import {PERMISSIONS} from "@/modules/admin/shared/permissions";
import {listOrders, type OrderDto} from "@/modules/admin/orders/orders.service";

export const dynamic = "force-dynamic";

export default async function AdminOrders() {
  const gate = await gateAdmin(PERMISSIONS.ordersRead);
  if (gate.state !== "ok") return <AdminDenied gate={gate} area="orders" />;
  const role = gate.staff.role as string;
  let orders: OrderDto[] | null = null;
  try { orders = await listOrders({limit: 100}); } catch { orders = null; }
  return <div className="page-wrap">
    <p className="kicker dark">OPERATIONS</p>
    <h1 className="page-title">Orders<span>.</span></h1>
    <p className="page-lead">Latest 100 orders. <b>PAID</b> is set only by the verified Razorpay webhook; staff move paid orders through production, quality control and dispatch with an audited reason.</p>
    {orders === null ? <p className="notice">Database unavailable. No order data can be shown.</p>
      : <OrdersAdmin orders={orders} canAdvance={(PERMISSIONS.ordersAdvance as readonly string[]).includes(role)} canRefund={(PERMISSIONS.ordersRefund as readonly string[]).includes(role)} />}
    <p className="notice">Refunds: a request creates a <code>REFUND_PENDING</code> order state and a <code>PENDING_APPROVAL</code> refund record for the full captured amount only. No live Razorpay refund is issued from this screen; execution and second approval are not yet built. SHIPPED / DELIVERED here are manual — include the courier AWB in the reason until Shiprocket (E12) is connected.</p>
    <Link className="text-link" href="/admin">← COMMAND CENTER</Link>
  </div>;
}
