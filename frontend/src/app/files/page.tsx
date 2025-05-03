import React from "react";
import UploadButton from "@/components/upload-button";
import FileTable from "@/components/files-table";

const page = () => {
  return (
    <div className="flex flex-col w-full">
      <div className="left-0">
        <UploadButton />
      </div>
      <div className="mt-7">
        <FileTable />
      </div>
    </div>
  );
};

export default page;
