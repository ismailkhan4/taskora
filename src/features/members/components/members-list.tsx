"use client";

import { Fragment } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { useDeleteMember } from "../api/use-delete-member";
import { useUpdateMember } from "../api/use-update-member";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useConfrim } from "@/hooks/use-confirm";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { MembersAvatar } from "@/features/members/components/members-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MemberRole } from "../types";

export const MembersList = () => {
  const workspaceId = useWorkspaceId();
  const router = useRouter();

  const [ConfirmDialog, confirm] = useConfrim(
    "Remove member",
    "This member will be removed from the workspace",
    "destructive",
  );

  const { data } = useGetMembers({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } = useUpdateMember();

  const handleUpdateMember = (memberId: string, role: MemberRole) => {
    updateMember({
      json: { role },
      param: { memberId },
    });
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      },
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button
          className=""
          variant="secondary"
          size="sm"
          onClick={() => router.push(`/workspaces/${workspaceId}`)}
        >
          <ArrowLeftIcon className="size-4 mr-2" />
          Back
        </Button>
        <CardTitle className="text-xl font-bold">Members List</CardTitle>
      </CardHeader>
      <div className="px-7">
        <DottedSeparator />
      </div>
      <CardContent className="p-7">
        {data?.rows.map((member, index) => (
          <Fragment key={member.$id}>
            <div className="flex items-center gap-2">
              <MembersAvatar
                className="size-10"
                fallBackClassName="text-lg"
                name={member.name}
              />
              <div className="flex flex-col">
                <p className="text-sm font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger className="ml-auto">
                  <Button variant="secondary" size="icon">
                    <MoreVerticalIcon className="size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="bottom"
                  align="end"
                  className="w-4xs"
                >
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.ADMIN)
                    }
                    disabled={isUpdatingMember}
                  >
                    Set as Administrator
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium"
                    onClick={() =>
                      handleUpdateMember(member.$id, MemberRole.MEMBER)
                    }
                    disabled={isUpdatingMember}
                  >
                    Set as Member
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="font-medium text-amber-700 hover:bg-amber-100"
                    onClick={() => handleDeleteMember(member.$id)}
                    disabled={isDeletingMember}
                  >
                    Remove {member.name}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {index < data.rows.length - 1 && (
              <Separator className="my-2.5 bg-neutral-200" />
            )}
          </Fragment>
        ))}
      </CardContent>
    </Card>
  );
};
