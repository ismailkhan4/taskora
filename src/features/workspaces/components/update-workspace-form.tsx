"use client";

import { z } from "zod";
import Image from "next/image";
import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, ImageIcon } from "lucide-react";
import {
  Controller,
  ErrorMessage,
  FormProvider,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUpdateWorkspace } from "../api/use-update-workspace";
import { updateWorkspaceSchema } from "../schemas";
import { Workspace } from "../types";

export type UpdateWorkspaceInitialValues = Pick<
  Workspace,
  "$id" | "name" | "imageUrl"
>;

interface UpdateWorkspaceFormProps {
  onCancel?: () => void;
  initialValues: UpdateWorkspaceInitialValues;
}

export const UpdateWorkspaceForm = ({
  onCancel,
  initialValues,
}: UpdateWorkspaceFormProps) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();

  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
      image: initialValues.imageUrl ?? "",
    },
  });
  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
      image: values.image instanceof File ? values.image : "",
    };
    mutate(
      { form: finalValues, param: { workspaceId: initialValues.$id } },
      {
        onSuccess: ({ data }) => {
          form.reset();
          router.push(`/workspaces/${data?.$id}`);
        },
      },
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button
          size={"sm"}
          variant={"secondary"}
          onClick={
            onCancel
              ? onCancel
              : () => router.push(`/workspaces/${initialValues.$id}`)
          }
        >
          <ArrowLeftIcon className="size-4 mr-2" />
          Back
        </Button>
        <CardTitle className="text-xl font-bold">
          {initialValues.name}
        </CardTitle>
        <div className="px-7">
          <DottedSeparator />
        </div>
      </CardHeader>
      <CardContent className="p-7">
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-y-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field }) => (
                  <div>
                    <Label>Workspace Name</Label>
                    <Input
                      {...field}
                      type="name"
                      placeholder="Enter workspace name"
                    />
                    <ErrorMessage name="name" />
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="image"
                render={({ field }) => (
                  <div className="flex flex-col gap-y-2">
                    <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="size-[72px] relative rounded-md overflow-hidden">
                          <Image
                            alt="logo"
                            fill
                            className="object-cover"
                            src={
                              field.value instanceof File
                                ? URL.createObjectURL(field.value)
                                : field.value
                            }
                          />
                        </div>
                      ) : (
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col">
                        <p className="text-sm">Workspace Icon</p>
                        <p className="text-sm text-muted-foreground">
                          JPG, PNG, SVG or JPEG, max 1MB
                        </p>
                        <input
                          type="file"
                          accept=".jpg, .png, .svg, .jpeg"
                          className="hidden"
                          ref={inputRef}
                          onChange={handleImageChange}
                          disabled={isPending}
                        />
                        {field.value ? (
                          <Button
                            className="w-fit mt-2"
                            disabled={isPending}
                            variant="destructive"
                            size="xs"
                            onClick={() => {
                              field.onChange(null);
                              if (inputRef.current) {
                                inputRef.current.value = "";
                              }
                            }}
                          >
                            Remove Image
                          </Button>
                        ) : (
                          <Button
                            className="w-fit mt-2"
                            disabled={isPending}
                            variant="teritrary"
                            size="xs"
                            onClick={() => inputRef.current?.click()}
                          >
                            Upload Image
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <DottedSeparator className="py-7" />
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                onClick={onCancel}
                disabled={isPending}
                className={cn(!onCancel && "invisible")}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
