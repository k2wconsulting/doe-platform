export interface FormulationItem {
  id?: number;
  material_id?: number | null;
  role: string;
  function_purpose?: string | null;
  amount: number;
  unit: string;
  is_dependent?: boolean;
}

export interface ProcedureBlock {
  id?: number;
  step_order: number;
  instruction: string;
  process_parameters?: any;
}

export interface FormulationVersion {
  id: number;
  thread_id: number;
  version_number: number;
  name: string;
  status: string;
  parent_version_id?: number | null;
  items: FormulationItem[];
  procedures: ProcedureBlock[];
}
