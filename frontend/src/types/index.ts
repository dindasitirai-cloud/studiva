export type UserRole = 'parent' | 'teacher' | 'admin';

export interface PublicUser {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  created_at: string;
}

export type EnrollmentStatus = 'enrolled_tier1' | 'not_enrolled';

export interface Child {
  id: number;
  name: string;
  age: number;
  learning_style: string | null;
  parent_id: number;
  enrollment_status: EnrollmentStatus;
  tier1_start_date: string | null;
  school_class: string | null;
  assigned_teacher_id: number | null;
  assigned_teacher_name?: string | null;
  emergency_contact: string | null;
  created_at: string;
}

export type UpdateCategory = 'academics' | 'behavior' | 'therapy' | 'social';

export interface DailyUpdate {
  id: number;
  child_id: number;
  teacher_id: number;
  content: string;
  photos: string | null;
  category: UpdateCategory;
  date: string;
}

export type ResourceCategory = 'Sensory' | 'Social' | 'Behavior' | 'Academic' | 'Therapy';
export type ResourceFormat = 'article' | 'video' | 'checklist' | 'template';

export interface Resource {
  id: number;
  title: string;
  description: string;
  content: string;
  category: ResourceCategory;
  format: ResourceFormat;
  author: string;
  published_date: string;
}

export type Tier = 'tier1' | 'tier2';
export type Plan = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'canceled' | 'expired';

export interface Subscription {
  id: number;
  user_id: number;
  tier: Tier;
  plan: Plan;
  status: SubscriptionStatus;
  start_date: string;
  end_date: string;
  payment_method: 'stripe' | 'manual';
  stripe_subscription_id: string | null;
  amount_paid: number;
  created_at: string;
}

export interface SubscriptionCheck {
  hasSubscription: boolean;
  tier: Tier | null;
  expiresAt: string | null;
}

export type ConsultationType = 'online' | 'offline';
export type ConsultationStatus = 'pending' | 'confirmed' | 'completed' | 'canceled';

export interface Consultation {
  id: number;
  user_id: number;
  child_id: number;
  consultation_type: ConsultationType;
  status: ConsultationStatus;
  consultation_date: string | null;
  consultation_time: string | null;
  notes: string | null;
  outcome_notes: string | null;
  created_at: string;
  child_name: string;
  requester_name?: string;
}

export interface ConsultationConfig {
  psikologName: string;
  onlinePrice: number;
  offlinePrice: number;
  onlineDuration: number;
  offlineDuration: number;
}

export type EnrollmentRequestStatus = 'pending' | 'approved' | 'rejected';

export interface EnrollmentRequest {
  id: number;
  user_id: number;
  child_id: number;
  message: string | null;
  status: EnrollmentRequestStatus;
  created_at: string;
  child_name?: string;
  requester_name?: string;
}

export type DiscussionCategory = 'general' | 'tier1' | 'tier2' | 'topic' | 'fitri';

export interface Discussion {
  id: number;
  title: string;
  content: string;
  author_id: number;
  category: DiscussionCategory;
  subcategory: string | null;
  is_anonymous: number;
  is_pinned: number;
  is_solved: number;
  views_count: number;
  replies_count: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author_name: string;
  author_role: UserRole;
  display_name: string;
  tags: string[];
  is_expert: boolean;
  expert_badge: string | null;
}

export interface Comment {
  id: number;
  discussion_id: number;
  author_id: number;
  content: string;
  is_anonymous: number;
  is_marked_helpful: number;
  likes_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author_name: string;
  display_name: string;
  is_expert: boolean;
  expert_badge: string | null;
}

export interface CommunityTag {
  id: number;
  name: string;
  discussion_count: number;
  created_at: string;
}

export type ReportContentType = 'discussion' | 'comment';
export type ReportReason = 'spam' | 'rude' | 'off-topic' | 'inappropriate';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface CommunityReport {
  id: number;
  content_id: number;
  content_type: ReportContentType;
  reporter_id: number;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  admin_notes: string | null;
  reviewed_by: number | null;
  created_at: string;
  reviewed_at: string | null;
}

export interface CommunityProfile {
  id: number;
  user_id: number;
  bio: string | null;
  is_champion: number;
  is_expert: number;
  expert_badge: string | null;
  discussions_count: number;
  helpful_count: number;
  likes_received: number;
  joined_date: string;
  last_active: string;
}

export interface CategoryInfo {
  label: string;
  subcategories: string[];
}

export interface AdminProfile {
  id: number;
  user_id: number;
  title: string;
  credentials: string | null;
  bio: string | null;
  expertise_areas: string[];
  phone: string | null;
  whatsapp_link: string | null;
  location: string | null;
  is_featured: number;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalDiscussions: number;
  postsThisWeek: number;
  activeUsersThisWeek: number;
  pendingReports: number;
  totalRevenue: number;
  upcomingConsultations: number;
}
