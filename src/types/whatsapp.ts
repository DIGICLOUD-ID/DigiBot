export type WhatsAppConnectionStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export interface WhatsAppGroupInfo {
  id: string;
  subject: string;
  owner?: string;
  creation?: number;
  participantsCount: number;
}

export interface WhatsAppStatusResponse {
  status: WhatsAppConnectionStatus;
  connected: boolean;
  user: {
    id?: string;
    name?: string;
  } | null;
  targetGroups: string[];
  pendingMessages: number;
  uptimeSeconds: number;
}
