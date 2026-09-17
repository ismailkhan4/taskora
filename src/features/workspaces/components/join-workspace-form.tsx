"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { DottedSeparator } from "@/components/dotted-separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useJoinWorkspace } from "../api/use-join-workspace";

interface JoinWorkspaceFormProps {
  initialValues: {
    name: string;
  };
  code: string;
  workspaceId: string;
}

export const JoinWorkspaceForm = ({
  initialValues,
  code,
  workspaceId,
}: JoinWorkspaceFormProps) => {
  const { mutate, isPending } = useJoinWorkspace();

  const router = useRouter();

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { code },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data.$id}`);
        },
      },
    );
  };
  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">Join Workspace</CardTitle>
        <CardDescription>
          You&apos;ve been invited to join <strong>{initialValues.name}</strong>{" "}
          workspace.
        </CardDescription>
        <div className="px-7">
          <DottedSeparator />
        </div>
      </CardHeader>
      <CardContent className="p-7">
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <Button
            className="w-full lg:w-fit"
            variant="secondary"
            type="button"
            size="lg"
            disabled={isPending}
          >
            <Link href={"/"}>Cancel</Link>
          </Button>
          <Button
            className="w-full lg:w-fit"
            size="lg"
            onClick={onSubmit}
            disabled={isPending}
          >
            Join Workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
