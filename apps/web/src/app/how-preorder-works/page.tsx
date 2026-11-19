import Link from "next/link";

export const metadata = {
  title: "How preorder works | VERSE//MODE",
  description: "Honest make-to-order steps — interest requests, deposits, and manufacturing gates.",
};

export default function HowPreorderWorks() {
  return (
    <div className="page-wrap">
      <p className="kicker dark">MAKE TO ORDER</p>
      <h1 className="page-title">
        How preorder works<span>.</span>
      </h1>
      <p className="page-lead">
        We do not ship from a warehouse of leftover stock. Each VERSE//MODE piece is designed first, then manufactured
        only after you commit — and only when supplier, legal and payment gates say it is safe to take money.
      </p>
      <div className="steps preorder-steps">
        <div>
          <b>01 · Browse</b>
          <p>Explore tees and track pants with original verse-led artwork. Concepts are labelled honestly.</p>
        </div>
        <div>
          <b>02 · Request interest</b>
          <p>
            On most styles you can save your email and size. <strong>No payment is taken.</strong> This is not an order.
          </p>
        </div>
        <div>
          <b>03 · Preorder opens</b>
          <p>When sample, capacity and legal checks pass, a SKU may open for a refundable deposit or full prepayment.</p>
        </div>
        <div>
          <b>04 · Make & ship</b>
          <p>Production runs in batches with QC. Dispatch windows are confirmed — never invented on the product page.</p>
        </div>
      </div>
      <p className="notice">
        Payment features stay disabled until the business owner enables checkout. You will always see whether you are
        requesting a design versus placing a paid preorder.
      </p>
      <Link href="/shop" className="primary-cta">
        Shop concepts
      </Link>
    </div>
  );
}