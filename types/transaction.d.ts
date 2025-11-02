interface Transaction {
  id: number;
  transaction_number: string;
  customer_name?: string;
  customer_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_method: "cash" | "card" | "transfer";
  payment_card_id?: number;
  payment_status: "pending" | "paid" | "cancelled";
  status: "draft" | "completed" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  quantity: number;
  price: number;
  discount: number;
  subtotal: number;
  created_at: string;
  updated_at: string;
}

interface CardTransactionProps {
  item: any;
  formatIDR: (amount: number) => string;
  onUpdateQty: (itemId: number, newQty: number) => void;
}

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  paymentMethod: "cash" | "card" | "transfer";
  selectedPaymentCardId: number | null;
  paymentCards: PaymentCard[];
  amountPaid: string;
  formatIDR: (amount: number) => string;
  formatIdrNumber: (raw: string) => string;
  getAmountPaidValue: () => number;
  getSuggestedAmounts: () => number[];
  isAmountInsufficient: () => boolean;
  getPaymentMethodLabel: (method: PaymentMethodOption) => string;
  onPaymentMethodChange: (method: "cash" | "card" | "transfer") => void;
  onPaymentCardSelect: (cardId: number | null) => void;
  onAmountPaidChange: (text: string) => void;
  onSavePaymentInfo: () => void;
}
