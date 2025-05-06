"use client";
import React from "react";
import { useParams } from "next/navigation";
const useFileName = () => {
  const param = useParams();
  return param.filename;
};

export default useFileName;
