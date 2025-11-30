export interface AuthPayload {
  userId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface ProfileResponse {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  trialExpiresAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JwtToken {
  token: string;
  expiresIn: string;
}

export interface CampaignCreateRequest {
  name: string;
  messageBody: string;
  delayType?: 'fast' | 'balanced' | 'safe';
}

export interface ContactData {
  phone: string;
  name?: string;
  metadata?: Record<string, any>;
  tags?: string[];
}

export interface CampaignStats {
  totalContacts: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  deliveryRate: number;
}

export interface WhatsAppQRResponse {
  qrCode: string;
  sessionId: string;
  expiresIn: number;
}

export interface MessageSendRequest {
  phone: string;
  message: string;
}

export interface BatchMessageRequest {
  messages: MessageSendRequest[];
}
