export const formatIDR = (amount: number): string => {
  const safe = Number.isFinite(amount) ? amount : 0;
  return `Rp ${Math.max(0, Math.round(safe)).toLocaleString("id-ID")}`;
};

export default formatIDR;
