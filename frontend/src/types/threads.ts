export interface Thread {
  id: number;
  project_id: number;
  parent_thread_id?: number | null;
  name: string;
  description: string;
  status: string;
}

export interface ThreadCreateData {
  name: string;
  description?: string;
  parent_thread_id?: number | null;
}

export interface ThreadMergeData {
  target_thread_id: number;
  merge_notes: string;
}
