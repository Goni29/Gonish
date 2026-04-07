function toCompactText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function formatAmountNumber(value: number) {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
}

export function roundEstimateAmountToFive(value: number) {
  return Math.ceil(value / 5) * 5;
}

export function formatEstimateAmount(value: number) {
  return `${formatAmountNumber(value)}만 원`;
}

export function formatEstimateRange(min: number, max: number) {
  return `${formatAmountNumber(min)}만 ~ ${formatAmountNumber(max)}만 원`;
}

export function parseEstimateAmount(value: string) {
  const normalized = toCompactText(value).replace(/,/g, "");
  if (!normalized) {
    return null;
  }

  const directMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*(?:만|만원|만 원)?$/u);
  if (directMatch) {
    const amount = Number(directMatch[1]);
    return Number.isFinite(amount) ? amount : null;
  }

  const firstNumberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!firstNumberMatch) {
    return null;
  }

  const amount = Number(firstNumberMatch[1]);
  return Number.isFinite(amount) ? amount : null;
}

export function normalizeEstimateBasePriceInput(value: string) {
  const normalized = toCompactText(value);
  if (!normalized) {
    return "";
  }

  const compact = normalized.replace(/,/g, "");
  const directMatch = compact.match(/^(\d+(?:\.\d+)?)\s*(?:만|만원|만 원)?$/u);
  if (!directMatch) {
    return normalized;
  }

  return formatEstimateAmount(Number(directMatch[1]));
}

export function normalizeEstimatePriceRangeInput(value: string) {
  const normalized = toCompactText(value);
  if (!normalized) {
    return "";
  }

  const compact = normalized.replace(/,/g, "");
  const rangeMatch = compact.match(/^(\d+(?:\.\d+)?)\s*(?:만|만원|만 원)?\s*(?:~|-|to)\s*(\d+(?:\.\d+)?)\s*(?:만|만원|만 원)?$/iu);
  if (!rangeMatch) {
    return normalized;
  }

  const min = Number(rangeMatch[1]);
  const max = Number(rangeMatch[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return normalized;
  }

  return formatEstimateRange(Math.min(min, max), Math.max(min, max));
}

export function buildEstimateContractPaymentLabels(basePrice: string) {
  const quoteLabel = normalizeEstimateBasePriceInput(basePrice);
  if (!quoteLabel) {
    return {
      quoteLabel: "",
      depositLabel: "",
      balanceLabel: "",
    };
  }

  const amount = parseEstimateAmount(quoteLabel);
  if (amount === null) {
    return {
      quoteLabel,
      depositLabel: "",
      balanceLabel: "",
    };
  }

  const depositAmount = roundEstimateAmountToFive(amount / 2);
  const balanceAmount = Math.max(0, Number((amount - depositAmount).toFixed(2)));

  return {
    quoteLabel,
    depositLabel: `50% / ${formatEstimateAmount(depositAmount)}`,
    balanceLabel: `50% / ${formatEstimateAmount(balanceAmount)}`,
  };
}
