import {
  toOnchainError,
  type OnchainClient,
  type UsdAmount,
} from "@thenamespace/onchain-subnames";

export const getPaymentAmounts = async (
  client: OnchainClient,
  price: UsdAmount | null
): Promise<Record<string, bigint>> => {
  if (price === null) return {};
  const quotes = await Promise.all(
    client.deployment.paymentTokens.map(async token => {
      try {
        const quote = await client.getPaymentQuote({
          price,
          paymentToken: token.address,
        });
        return [token.symbol, quote.amount] as const;
      } catch (cause) {
        const error = toOnchainError(cause);
        if (
          error.code === "UNSUPPORTED_TOKEN" ||
          error.details.contractError === "UnsupportedPaymentToken"
        )
          return null;
        throw error;
      }
    })
  );
  return Object.fromEntries(quotes.filter(quote => quote !== null));
};
