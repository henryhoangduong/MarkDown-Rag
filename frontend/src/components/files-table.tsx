"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";
import { FileActionDropDown } from "./file-action-dropdown";
const FileTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoadding] = useState<boolean>(false);
  useEffect(() => {
    const fetchData = async () => {
      setLoadding(true);
      try {
        const res = await fetch("/api/files", {
          method: "GET",
        });
        const res_json = await res.json();
        if (res_json) {
          toast.success("Files loaded", { id: "load-files" });
          setData(res_json);
        }
        toast.info("Something went wrong", { id: "load-files" });
      } catch (error) {
        toast.error("Error loading files", { id: "load-files" });
      } finally {
        setLoadding(false);
      }
    };
    fetchData();
  }, []);
  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">
                {loading ? <Skeleton className="h-3 w-[100px]" /> : "Name"}
              </TableHead>
              <TableHead className="text-center">
                {" "}
                {loading ? <Skeleton className="h-3 w-[100px]" /> : "Status"}
              </TableHead>
              <TableHead className="text-center">
                {" "}
                {loading ? (
                  <Skeleton className="h-3 w-[100px]" />
                ) : (
                  "Date added"
                )}
              </TableHead>
              <TableHead className="text-center">
                {" "}
                {loading ? <Skeleton className="h-3 w-[100px]" /> : "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.length > 0 &&
              data.map((item) => {
                return <FileRow data={item} />;
              })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FileTable;

const FileRow = (data: any) => {
  return (
    <TableRow key={data.data.name}>
      <TableCell className="font-medium">{data.data.name}</TableCell>
      <TableCell className="text-center">Embedded</TableCell>
      <TableCell className="text-center">Today</TableCell>
      <TableCell className="text-center">
        <FileActionDropDown />
      </TableCell>
    </TableRow>
  );
};
