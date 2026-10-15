/**
 * The notifier contract. Everything the app wants to tell you goes through
 * this — WhatsApp today, something else tomorrow, one file to change.
 *
 * Hard rule (PLAN.md §2.4): the notifier is NEVER in the publishing critical
 * path. If the CRM is down, posts still publish.
 */
export type ApprovalRequest = {
  postId: string;
  brandName: string;
  title: string;
  platforms: string[];
  handles: string[];
  scheduledAt: Date;
  captionExcerpt: string;
  previewUrl: string;
  approveUrl: string;
  rejectUrl: string;
};

export type PublishReport = {
  postId: string;
  brandName: string;
  platform: string;
  handle: string;
  url: string | null;
  at: Date;
};

export type FailureReport = {
  postId: string;
  brandName: string;
  platform: string;
  handle: string;
  code: string;
  message: string;
  action: string;
  retryUrl: string;
  attempts: number;
};

export type DailyDigest = {
  date: Date;
  goingOutToday: Array<{ time: string; brandName: string; platforms: string[]; title: string }>;
  wentOutYesterday: PublishReport[];
  failures: FailureReport[];
  quota: Array<{ handle: string; platform: string; used: number; total: number }>;
  studioUrl: string;
};

export type AlarmKind = "quota" | "token" | "worker" | "custom";

export type Alarm = {
  kind: AlarmKind;
  title: string;
  detail: string;
  actionUrl?: string;
};

export type Notifier = {
  name: string;
  /** True when the required credentials are present. */
  isConfigured(): boolean;
  sendText(to: string | null, text: string): Promise<NotifyResult>;
  sendApprovalRequest(to: string | null, request: ApprovalRequest): Promise<NotifyResult>;
  sendPublishReport(to: string | null, report: PublishReport): Promise<NotifyResult>;
  sendFailure(to: string | null, failure: FailureReport): Promise<NotifyResult>;
  sendDigest(to: string | null, digest: DailyDigest): Promise<NotifyResult>;
  sendAlarm(to: string | null, alarm: Alarm): Promise<NotifyResult>;
};

export type NotifyResult = { ok: true; id?: string; skipped?: boolean } | { ok: false; error: string };
