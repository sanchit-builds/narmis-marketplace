/**
 * NARMIS Platform Fee & Margin Calculator
 * 
 * Policy:
 * - Items priced or valued at ₹1,000 or below: 10% platform margin is applied
 *   (e.g., on a ₹1,000 item, ₹100 is NARMIS platform margin, seller gets ₹900).
 * - Items above ₹1,000: Standard 5% platform margin is applied.
 */

export interface MarginBreakdown {
  originalPrice: number;
  marginRate: number; // e.g. 0.10 for 10%
  marginPercentText: string; // '10%' or '5%'
  platformMargin: number; // In ₹
  sellerPayout: number; // In ₹ (originalPrice - platformMargin)
  isTenPercentTier: boolean; // True when price <= 1000
  tierLabel: string;
  description: string;
}

export function calculatePlatformMargin(amount: number): MarginBreakdown {
  const safeAmount = Math.max(0, Math.round(Number(amount) || 0));

  if (safeAmount <= 1000) {
    const margin = Math.round(safeAmount * 0.10);
    return {
      originalPrice: safeAmount,
      marginRate: 0.10,
      marginPercentText: '10%',
      platformMargin: margin,
      sellerPayout: safeAmount - margin,
      isTenPercentTier: true,
      tierLabel: '10% Fair-Share Tier (≤ ₹1,000)',
      description: '10% platform margin supports peer escrow, verification, and zero-fraud guarantee for items ₹1,000 or below.',
    };
  } else {
    const margin = Math.round(safeAmount * 0.05);
    return {
      originalPrice: safeAmount,
      marginRate: 0.05,
      marginPercentText: '5%',
      platformMargin: margin,
      sellerPayout: safeAmount - margin,
      isTenPercentTier: false,
      tierLabel: '5% Standard Tier (> ₹1,000)',
      description: '5% standard platform margin for higher-value equipment and instruments.',
    };
  }
}
