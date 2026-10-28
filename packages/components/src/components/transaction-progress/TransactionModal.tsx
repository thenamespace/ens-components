import React from "react";
import { Button } from "@/components/atoms";
import { Modal } from "@/components/molecules";
import {
  TransactionProgress,
  TransactionProgressProps,
} from "./TransactionProgress";

export interface TransactionModalProps extends TransactionProgressProps {
  isOpen: boolean;
  onClose: () => void;
  /** Replaces the default Close button */
  footer?: React.ReactNode;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  footer,
  ...progressProps
}) => {
  const isPending = progressProps.status === "pending";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isDismissDisabled={isPending}
      footer={
        footer ?? (
          <Button variant="outline" disabled={isPending} onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <TransactionProgress {...progressProps} />
    </Modal>
  );
};

export default TransactionModal;
