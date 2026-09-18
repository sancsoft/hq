import { ProjectColorStatus } from '../../enums/project-color-status';

export function projectStatusToClass(colorStatus: ProjectColorStatus): string {
  switch (colorStatus) {
    case ProjectColorStatus.Gray:
      return 'gray-450';
      break;

    case ProjectColorStatus.Green:
      return 'green-600';
      break;

    case ProjectColorStatus.Yellow:
      return 'yellow-550';
      break;

    case ProjectColorStatus.Red:
      return 'red-600';
      break;

    default:
      return 'gray-450';
      break;
  }
}
