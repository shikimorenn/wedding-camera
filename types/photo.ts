export interface Photo {
  id: string;
  event_id: string;
  session_id: string;
  storage_path: string;
  file_size: number | null;
  created_at: string;
}
