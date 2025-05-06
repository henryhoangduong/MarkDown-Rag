"use client";
import React from "react";
import { useParams } from "next/navigation";
const UseFileName = () => {
  const param = useParams();
  return param.filename;
};

export default UseFileName;
