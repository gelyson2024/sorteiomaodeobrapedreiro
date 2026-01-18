
export enum TicketStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  PAID = 'PAID',
  UNAVAILABLE = 'UNAVAILABLE'
}

export interface BuyerInfo {
  name: string;
  whatsapp: string;
  cpf?: string;
  receiptUrl?: string;
}

export interface Ticket {
  number: string;
  status: TicketStatus;
  reservedAt?: number; // timestamp
  buyer?: BuyerInfo;
}

export interface RaffleInfo {
  title: string;
  prize: string;
  price: number;
  rules: string[];
}
