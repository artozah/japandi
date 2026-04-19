'use client';

import { PricingCards } from '@/components/home/PricingCards';
import { Modal } from '@/components/ui/Modal';

interface ViewPlansModalProps {
  open: boolean;
  onClose: () => void;
}

export function ViewPlansModal({ open, onClose }: ViewPlansModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Plans" maxWidth="max-w-5xl">
      <p className="mb-4 text-sm text-muted-foreground">
        Buy tokens to generate redesigns. 1 token = 1 image.
      </p>
      <PricingCards />
    </Modal>
  );
}
