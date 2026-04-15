export interface Project {
  id: number;
  name: string;
  description: string;
  has_prior_data: boolean;
  workflow_preference: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectObjective {
  parameter: string;
  target_value: number | null;
  direction: string | null;
  weight: number;
}

export interface ProjectConstraint {
  constraint_type: string | null;
  description: string | null;
  limit_value: number | null;
  operator: string | null;
}

export interface ProjectIntakePayload {
  objectives: ProjectObjective[];
  constraints: ProjectConstraint[];
}
