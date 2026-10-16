export type UserRole = "user" | "admin";

export interface UserContext {
  userId: string;
  role: UserRole;
  requestId: string;
}

export interface IntentResult {
  intent: "system" | "files" | "rag" | "automation";
  action: string;
  args: Record<string, unknown>;
  requiresConfirmation: boolean;
}
