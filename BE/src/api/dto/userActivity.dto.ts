/**
 * ========== USER ACTIVITY DTOs ==========
 * Data Transfer Objects cho danh sách lịch sử hoạt động chi tiết của người dùng
 */

export interface ActivityItemDTO {
  id: string;
  type: "application" | "interview" | "job_post" | "payment";
  title: string;
  subtitle?: string;
  status: string;
  statusColor?: string;
  date: Date;
  details?: Record<string, any>;
}

export interface UserActivitiesResponseDTO {
  success: boolean;
  message: string;
  data: ActivityItemDTO[];
}
