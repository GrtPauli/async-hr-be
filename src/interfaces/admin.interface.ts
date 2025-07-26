export interface DashboardStats {
  totalEmployees: number;
  employeesWithCompletedProfiles: number;
  todayHours: number;
  weekHours: number;
  monthHours: number;
}

export interface TopPerformer {
  userId: string;
  name: string;
  totalHours: number;
  daysWorked: number;
}
