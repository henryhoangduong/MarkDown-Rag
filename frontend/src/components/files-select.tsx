"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UseFileName from "../hooks/use-file-name";
const FileSelect = () => {
  const router = useRouter();
  const fileName = UseFileName()
  const handleClick = (value: string) => {
    router.push(value);
  };
  const { data, isPending } = useQuery({
    queryKey: ["files"],
    queryFn: async () =>
      await fetch("/api/files", { method: "GET" })
        .then((res) => res.json())
        .catch(),
  });

  return (
    <Select
      onValueChange={(value) => {
        handleClick(value);
      }}
      value={fileName as string}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a file" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Files</SelectLabel>
          {!isPending &&
            data.map((item: [], index: number) => {
              return (
                <SelectItem key={index} value={item.name}>
                  {item.name}
                </SelectItem>
              );
            })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default FileSelect;
