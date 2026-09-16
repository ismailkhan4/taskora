import type { Models } from "node-appwrite";

export type Workspace = Models.Row & {
  name: string;
  imageUrl: string | null;
  inviteCode: string;
  userId: string;
};
