'use client';

import { Modal } from '@/components/ui/Modal';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const FAQ_ITEMS: Array<{ q: string; a: string }> = [
  {
    q: 'What is Japandi?',
    a: 'Japandi is an AI-powered interior redesign tool. Upload a photo of any room and generate reimagined versions in dozens of styles, locations, themes, or lighting conditions — without moving a piece of furniture in real life.',
  },
  {
    q: 'How does it work?',
    a: 'Upload a room photo, then either pick a style from the left menu, type what you want in the chat, or apply an Enhance (like “Remove furniture” or “Golden hour light”). Each generation takes a few seconds and runs on a specialised image-to-image AI model.',
  },
  {
    q: 'What counts as 1 token?',
    a: 'One token = one image generation. If a generation fails, is cancelled, or errors out on our side, we automatically refund the token to your balance — you only pay for images you keep.',
  },
  {
    q: 'What do I get for free?',
    a: 'Every new account starts with 5 free tokens so you can try the service before paying. Free tokens never expire.',
  },
  {
    q: 'How do I buy more tokens?',
    a: 'Open the Pricing section (or click “View all plans” in the user menu). Choose a one-time Custom pack or a monthly Standard / Professional subscription. Subscription token balances reset to the plan amount each billing cycle.',
  },
  {
    q: 'How do I cancel or get a refund?',
    a: 'Cancel a subscription anytime from your Paddle receipt email or by emailing support. The cancellation takes effect at the end of your current billing period. For monetary refund rules, see the Refund Policy in the footer.',
  },
  {
    q: 'What image formats are supported?',
    a: 'JPG, PNG, and WebP, up to reasonable file sizes. Photos taken with any smartphone or camera work well — the clearer the room, the better the redesign.',
  },
  {
    q: 'Are my photos used to train AI models?',
    a: 'No. Your uploads and generations are used solely to run the service on your behalf. See our Privacy Policy for details on how we handle your data.',
  },
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Get help" maxWidth="max-w-xl">
      <Tabs
        tabs={[
          { id: 'faq', label: 'FAQ', content: <FaqTab /> },
          { id: 'feedback', label: 'Feedback', content: <FeedbackTab /> },
        ]}
      />
    </Modal>
  );
}

function FaqTab() {
  return (
    <div className="flex flex-col divide-y divide-border">
      {FAQ_ITEMS.map((item, idx) => (
        <FaqItem key={idx} question={item.q} answer={item.a} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:text-muted-foreground"
        aria-expanded={open}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <p className="pb-4 pr-6 text-sm leading-6 text-muted-foreground">
          {answer}
        </p>
      )}
    </div>
  );
}

function FeedbackTab() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const MAX = 2000;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          contactEmail: email.trim() || undefined,
        }),
      });
      if (!res.ok) {
        toast.error('Could not send feedback. Please try again.');
        return;
      }
      toast.success('Thanks — we read every message.');
      setMessage('');
      setEmail('');
    } catch {
      toast.error('Could not send feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        Message
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX}
          rows={6}
          placeholder="Tell us what's working, what's broken, or what you'd love to see…"
          className="resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-right text-[11px] tabular-nums text-muted-foreground">
          {message.length} / {MAX}
        </span>
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        Contact email (optional)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Leave blank to use your account email"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || message.trim().length === 0}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending…' : 'Send feedback'}
        </button>
      </div>
    </form>
  );
}
