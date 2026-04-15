export interface ResponseDefinition {
  id?: number;
  name: string;
  unit: string;
  type?: string;
}

export interface ExperimentResult {
  id?: number;
  response_id: number;
  value: number;
}

export interface ExperimentRun {
  id: number;
  run_number: number;
  formulation_id?: number | null;
  status: string;
  results: ExperimentResult[];
}

export interface ExperimentPlan {
  id: number;
  name: string;
  status: string;
  design_type: string;
  responses: ResponseDefinition[];
  runs: ExperimentRun[];
}

export interface ExperimentCreateData {
  name: string;
  design_type: string;
  responses: ResponseDefinition[];
}
