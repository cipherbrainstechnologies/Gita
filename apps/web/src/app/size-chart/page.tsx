import Link from "next/link";
import {loadSizeCharts, prettyKey} from "@/lib/size-chart";

export const metadata = {title: "Size chart | VERSE//MODE"};
export const dynamic = "force-dynamic";

const GUIDE: [string, string][] = [
  ["Chest", "Measure around the fullest part of your chest, keeping the tape level under your arms."],
  ["Length", "Measure a favourite tee flat, from the highest point of the shoulder to the hem."],
  ["Waist", "Measure around your natural waistline, where the garment will sit. Tape snug, not tight."],
  ["Inseam", "Measure a pair of pants that fit well, from the crotch seam to the bottom of the leg."]
];

export default async function SizeChart() {
  const tables = await loadSizeCharts();
  return <div className="page-wrap legal">
    <p className="kicker dark">FIT GUIDE</p>
    <h1 className="page-title">Size chart<span>.</span></h1>
    <p className="page-lead">Garment measurements are taken flat on the finished piece. Measure a garment you already love and compare it with the chart.</p>
    {tables.length === 0
      ? <p className="notice">Final garment measurements are being confirmed with our manufacturer and will be published here before any piece opens for preorder. We do not publish estimated measurements.</p>
      : tables.map(t => <section key={t.slug} className="size-table-wrap">
          <h2>{t.product}</h2>
          <div className="table-scroll"><table className="size-table">
            <thead><tr><th scope="col">SIZE</th>{t.columns.map(c => <th scope="col" key={c}>{prettyKey(c).toUpperCase()}</th>)}</tr></thead>
            <tbody>{t.rows.map(r => <tr key={r.size}><th scope="row">{r.size}</th>{t.columns.map(c => <td key={c}>{r.values[c] ?? "—"}</td>)}</tr>)}</tbody>
          </table></div>
          <p><Link className="text-link" href={`/shop/${t.slug}`}>VIEW PRODUCT</Link></p>
        </section>)}
    <h2 className="sub-title">How to measure</h2>
    <dl className="guide-list">{GUIDE.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
    <p>Between sizes? Choose the larger size for a relaxed fit. Preorder pieces are made after you order, so please confirm your size before paying; see our <Link className="text-link" href="/policies">policies</Link> for cancellation terms. Questions: <Link className="text-link" href="/contact">contact us</Link>.</p>
  </div>;
}
