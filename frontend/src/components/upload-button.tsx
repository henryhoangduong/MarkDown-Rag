"use client";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
const formSchema = z.object({
  title: z.string().min(1).max(200),
  file: z
    .custom<FileList>((val) => val instanceof FileList, "Required")
    .refine((files) => files.length > 0, "Required"),
});
const UploadButton = () => {
  const [isFileDialOpen, setIsFileDialOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      file: undefined,
    },
  });
  const fileRef = form.register("file");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    toast.loading(`File uploading ${values.file[0].name}`, {
      id: `upload-file ${values.file[0].name}`,
    });
    try {
      const formData = new FormData();
      formData.append("file", values.file[0]);
      setIsFileDialOpen(false);
      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });
      form.reset();
      if (res.status == 200) {
        toast.success(`File ${values.file[0].name} has been uploaded.`, {
          id: `upload-file ${values.file[0].name}`,
        });
      } else {
        toast.error(`File ${values.file[0].name} could not be uploaded.`, {
          id: `upload-file ${values.file[0].name}`,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(`File ${values.file[0].name} could not be uploaded.`, {
        id: `upload-file ${values.file[0].name}`,
      });
    }
  }
  return (
    <Dialog
      open={isFileDialOpen}
      onOpenChange={(isOpen) => {
        setIsFileDialOpen(isOpen);
        form.reset();
      }}
    >
      <DialogTrigger>
        <Button className="cursor-pointer">Upload a file</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload your file here</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="gap-3 flex flex-col"
          >
            <FormField
              name="title"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="File name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="file"
              control={form.control}
              render={() => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      {...fileRef}
                      className="cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            className="cursor-pointer"
            onClick={form.handleSubmit(onSubmit)}
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && (
              <Loader2 className="animate-spin" />
            )}
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
