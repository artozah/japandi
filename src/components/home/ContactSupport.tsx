'use client';

import { useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { MAX_MESSAGE_LENGTH } from '@/lib/contact';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactSupport() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mt-10 flex items-center justify-between gap-6 rounded-xl border border-border bg-card p-6">
        <div>
          <p className="text-sm font-medium text-foreground">
            Still have questions?
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            We reply within 24 hours on weekdays.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          Contact support
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Contact support"
        maxWidth="max-w-lg"
      >
        <ContactSupportForm onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}

function ContactSupportForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setErrorMessage(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('sent');
      setEmail('');
      setMessage('');
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">
            Thanks — your message is on its way.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            We reply within 24 hours on weekdays.
          </p>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        Your email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-foreground">
        Message
        <textarea
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={6}
          placeholder="How can we help?"
          className="resize-none rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span className="text-right text-[11px] tabular-nums text-muted-foreground">
          {message.length} / {MAX_MESSAGE_LENGTH}
        </span>
      </label>
      {status === 'error' && errorMessage && (
        <p className="text-xs text-red-500">{errorMessage}</p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-9 items-center rounded-md px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            status === 'sending' ||
            email.trim().length === 0 ||
            message.trim().length === 0
          }
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
