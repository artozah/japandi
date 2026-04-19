import {
  LegalPageLayout,
  SupportEmailLink,
} from '@/components/home/LegalPageLayout';

export const metadata = {
  title: 'Refund Policy · Japandi',
  description:
    'How refunds work for Japandi token purchases and subscriptions.',
};

export default function RefundPage() {
  return (
    <LegalPageLayout title="Refund Policy" lastUpdated="April 19, 2026">
      <p>
        We want you to get real value from Japandi. This page explains how
        token refunds work, when we refund purchases, and how to ask for one.
      </p>

      <h2>1. Free Tokens</h2>
      <p>
        Every new account receives a free starting balance of tokens so you
        can try the service before buying. Free tokens are not exchangeable
        for cash.
      </p>

      <h2>2. Automatic Token Refunds</h2>
      <p>
        If a generation fails for a reason on our side — the AI provider
        errors, the job is cancelled, or we fail to store the output — we
        automatically credit the token back to your balance. No action is
        needed from you. You can also cancel a generation yourself while it
        is still in flight and the token will be refunded.
      </p>
      <p>
        Automatic refunds apply to tokens only. Monetary refunds for the
        plans you purchased follow the rules below.
      </p>

      <h2>3. One-Time Purchases (Custom plan)</h2>
      <p>
        If you purchased the <strong>Custom</strong> one-time token pack and
        you have <strong>not yet spent any of the tokens it added</strong>,
        you can request a full refund within <strong>14 days</strong> of the
        purchase date. Once even one of the purchased tokens is spent, the
        pack is considered used and is non-refundable.
      </p>

      <h2>4. Subscriptions (Standard &amp; Professional)</h2>
      <p>
        You can cancel a subscription at any time from your Paddle customer
        portal. Cancellation takes effect at the end of the current billing
        period, after which no further charges will be made. You keep
        access and tokens until that period ends.
      </p>
      <p>
        For the very first subscription payment on a given plan, we honour a{' '}
        <strong>7-day refund</strong> if you have not spent more than 10
        tokens of the plan&rsquo;s monthly allocation. After the first
        period, renewal charges are generally non-refundable, but we will
        review exceptional cases (for example, an unintended renewal you
        surface within 48 hours).
      </p>

      <h2>5. How to Request a Refund</h2>
      <p>
        Email <SupportEmailLink /> from the address associated with your
        Japandi account and include:
      </p>
      <ul>
        <li>the Paddle order / subscription ID (see your receipt);</li>
        <li>the reason for the request (optional, but it helps us improve);</li>
        <li>the purchase date.</li>
      </ul>
      <p>
        We aim to process refund requests within{' '}
        <strong>5 business days</strong>. Approved refunds are returned
        through Paddle to the original payment method. Bank processing times
        may add several extra days.
      </p>

      <h2>6. Paddle as Merchant of Record</h2>
      <p>
        All payments are processed by Paddle, who acts as our merchant of
        record. Paddle handles tax, invoicing, and refund disbursement. You
        will see &ldquo;Paddle&rdquo; (or similar) on your card statement.
      </p>

      <h2>7. Chargebacks</h2>
      <p>
        If you have a billing concern, please reach out to us first — we can
        usually resolve it faster than a chargeback. Accounts with an
        unresolved chargeback may have their access suspended until the
        dispute is settled.
      </p>

      <h2>8. Statutory Rights</h2>
      <p>
        Nothing in this policy removes consumer-protection rights you have
        under the law in your country. Where local law grants a longer
        cooling-off period or stronger right to refund, we honour it.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy? Email <SupportEmailLink />.
      </p>
    </LegalPageLayout>
  );
}
