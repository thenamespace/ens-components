"use client";

import { TransactionProvider, TransactionModal } from "ethereum-identity-kit";
import { PropsWithChildren } from "react";

export const EfpProviders = ({ children }: PropsWithChildren) => {
  return (
    <TransactionProvider>
      <>
        <TransactionModal />
        {children}
      </>
    </TransactionProvider>
  );
};
