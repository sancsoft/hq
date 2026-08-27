export enum ProjectColorStatus {
  Gray = 0, // (Default - inactive)
  Green = 1, // On Track
  Yellow = 2, // At Risk
  Red = 3, // Critical
}

export const ProjectColorStatusLabels: Record<ProjectColorStatus, string> = {
  [ProjectColorStatus.Gray]: 'Inactive',
  [ProjectColorStatus.Green]: 'On Track',
  [ProjectColorStatus.Yellow]: 'At Risk',
  [ProjectColorStatus.Red]: 'Critical',
};
