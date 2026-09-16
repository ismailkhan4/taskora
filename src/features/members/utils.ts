import { Query, type TablesDB } from "node-appwrite";

import { DATABASE_ID, MEMBERS_ID } from "@/config";

interface GetMembersProps {
  tablesDB: TablesDB;
  workspaceId: string;
  userId: string;
}

export const getMember = async ({
  tablesDB,
  workspaceId,
  userId,
}: GetMembersProps) => {
  const members = await tablesDB.listRows({
    databaseId: DATABASE_ID,
    tableId: MEMBERS_ID,
    queries: [
      Query.equal("workspaceId", workspaceId),
      Query.equal("userId", userId),
    ],
  });

  return members.rows[0];
};

// const members = await tablesDB.listRows({
//       databaseId: DATABASE_ID,
//       tableId: MEMBERS_ID,
//       queries: [Query.equal("userId", user.$id)],
//     });
