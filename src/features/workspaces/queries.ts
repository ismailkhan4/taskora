import { Query } from "node-appwrite";

import { createSessionClient } from "@/lib/appwrite";
import { getMember } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";

import { Workspace } from "./types";

interface GetWorkspaceProps {
  workspaceId: string;
}

export const getWorkspaces = async () => {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const members = await databases.listRows({
      databaseId: DATABASE_ID,
      tableId: MEMBERS_ID,
      queries: [Query.equal("userId", user.$id)],
    });

    if (members.total === 0) {
      return { rows: [], total: 0 };
    }

    const workspaceIds = members.rows.map((member) => member.workspaceId);

    const workspaces = await databases.listRows({
      databaseId: DATABASE_ID,
      tableId: WORKSPACES_ID,
      queries: [
        Query.orderDesc("$createdAt"),
        Query.contains("$id", workspaceIds),
      ],
    });

    return workspaces;
  } catch {
    return { rows: [], total: 0 };
  }
};

export const getWorkspace = async ({ workspaceId }: GetWorkspaceProps) => {
  try {
    const { databases, account } = await createSessionClient();
    const user = await account.get();

    const member = await getMember({
      tablesDB: databases,
      userId: user.$id,
      workspaceId,
    });

    if (!member) return null;

    const workspace = await databases.getRow<Workspace>({
      databaseId: DATABASE_ID,
      tableId: WORKSPACES_ID,
      rowId: workspaceId,
    });

    return workspace;
  } catch {
    return null;
  }
};
