export interface Session {
  id: string;
  event_id: string;
  guest_name: string;
  device_id: string;
  photo_limit: number;
  photo_used: number;
  created_at: string;
  last_active: string;
}
