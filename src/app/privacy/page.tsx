import {
  LegalPageLayout,
  SupportEmailLink,
} from '@/components/home/LegalPageLayout';

export const metadata = {
  title: 'Privacy Policy · Envisio',
  description:
    'How Envisio collects, uses, stores, and shares your personal data.',
};

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="April 19, 2026">
      <p>
        This Privacy Policy describes what information Envisio
        (&ldquo;<strong>we</strong>&rdquo;, &ldquo;<strong>us</strong>&rdquo;)
        collects when you use our AI-powered interior redesign service, how
        we use it, and the choices you have.
      </p>

      <h2>1. Information We Collect</h2>
      <p>We collect only the data we need to operate Envisio.</p>
      <ul>
        <li>
          <strong>Account information:</strong> your email address, name,
          and an account identifier, collected through our authentication
          provider (Clerk). If you sign in with a social provider, we
          receive the profile fields that provider shares with you.
        </li>
        <li>
          <strong>Uploaded images:</strong> the photos of rooms you upload
          for redesign.
        </li>
        <li>
          <strong>Prompts and chat messages:</strong> the text you send to
          our in-app design chat, and any style selections you make.
        </li>
        <li>
          <strong>Generated images:</strong> the AI-generated output images
          attached to your account.
        </li>
        <li>
          <strong>Billing information:</strong> when you buy tokens or
          subscribe to a plan, Paddle processes the payment and shares with
          us the minimum we need to grant you access (email, plan,
          transaction ID, subscription status). We do not receive or store
          your full card details.
        </li>
        <li>
          <strong>Usage information:</strong> generation history, token
          balance, and basic server logs (e.g. request timestamps, error
          traces). We may use anonymised aggregate analytics to improve the
          product.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>to authenticate you and keep your account secure;</li>
        <li>
          to generate redesigns — this requires transmitting your upload and
          prompt to our AI provider on your behalf;
        </li>
        <li>
          to operate the in-app chat that helps you write better prompts
          (which uses a third-party LLM, see below);
        </li>
        <li>to meter and bill for tokens;</li>
        <li>to prevent abuse, fraud, and violations of our Terms;</li>
        <li>to notify you about material product or policy changes.</li>
      </ul>
      <p>
        We do not sell your personal information. We do not use your images,
        prompts, or generations to train our own AI models.
      </p>

      <h2>3. Third-Party Processors</h2>
      <p>
        Envisio uses specialised providers to run different parts of the
        service. Each one only receives the data it needs.
      </p>
      <ul>
        <li><strong>Clerk</strong> — authentication and account management.</li>
        <li>
          <strong>Vercel Blob</strong> — storage of your uploaded and
          generated images.
        </li>
        <li>
          <strong>Neon</strong> — Postgres database hosting for account,
          history, and billing metadata.
        </li>
        <li>
          <strong>Replicate</strong> — runs the AI model that produces
          redesigns. Your source image URL and prompt are sent to Replicate
          for each generation. Please see Replicate&rsquo;s privacy policy
          for how they process inputs.
        </li>
        <li>
          <strong>Anthropic (Claude)</strong> — processes prompt-assistance
          chat messages and, optionally, looks at the source photo to write
          a better generation prompt.
        </li>
        <li>
          <strong>Paddle</strong> — merchant of record for all payments,
          including tax handling, invoices, and refunds.
        </li>
      </ul>

      <h2>4. Sharing &amp; Disclosure</h2>
      <p>
        We do not share your personal data with anyone except the processors
        listed above, unless we are legally required to (for example, in
        response to a valid court order) or if a transfer is necessary in
        the context of a merger, acquisition, or sale of assets.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We keep your account data and generated content for as long as your
        account is active. When you delete a generation, we delete the
        underlying blob file and database row. When you delete your account
        (email us to request this) we remove your personal data within 30
        days, except for records we must retain for legal or accounting
        reasons (typically up to 7 years for billing records).
      </p>

      <h2>6. Security</h2>
      <p>
        We use HTTPS everywhere, signed webhooks for payment events, and
        row-level ownership checks on every data access. No service on the
        internet is perfectly secure; we work to keep your data safe but
        cannot guarantee absolute security.
      </p>

      <h2>7. Your Rights</h2>
      <p>Depending on where you live, you may have the right to:</p>
      <ul>
        <li>access a copy of the personal data we hold about you;</li>
        <li>correct inaccurate information;</li>
        <li>
          delete your account and associated content (some records may be
          retained for legal reasons);
        </li>
        <li>object to or restrict certain processing;</li>
        <li>data portability;</li>
        <li>withdraw consent at any time where we rely on it.</li>
      </ul>
      <p>
        To exercise these rights, email <SupportEmailLink />. We respond
        within 30 days.
      </p>

      <h2>8. Children</h2>
      <p>
        Envisio is not intended for users under 13 (or the minimum age in
        your jurisdiction). We do not knowingly collect personal data from
        children. If you believe a child has created an account, please
        contact us and we will remove it.
      </p>

      <h2>9. International Transfers</h2>
      <p>
        Our service and processors may operate in different countries than
        the one you live in. By using Envisio, you consent to your data
        being transferred to and processed in those countries, each of
        which may have different data protection rules than your own.
      </p>

      <h2>10. Cookies</h2>
      <p>
        We use the cookies strictly necessary to operate the service: an
        authentication cookie set by Clerk so you stay logged in, and a
        Paddle session cookie during checkout. We do not currently use
        advertising or tracking cookies.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy over time. Material changes will
        be communicated by email or in the app before they take effect.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions? Email <SupportEmailLink />.
      </p>
    </LegalPageLayout>
  );
}
