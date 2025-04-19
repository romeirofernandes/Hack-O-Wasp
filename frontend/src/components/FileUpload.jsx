import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export const FileUpload = ({ onUploadStart, onUploadComplete }) => {
  const onDrop = useCallback(
    async (acceptedFiles) => {
      try {
        const file = acceptedFiles[0];
        if (!file) return;

        onUploadStart();

        // Read file as ArrayBuffer
        const buffer = await file.arrayBuffer();

        const response = await fetch("http://localhost:8000/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/pdf",
          },
          body: buffer,
        });

        const data = await response.json();
        onUploadComplete(data);
      } catch (error) {
        console.error("Upload failed:", error);
      }
    },
    [onUploadStart, onUploadComplete]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 h-60 border-dashed rounded-lg p-8 flex flex-col justify-center items-center text-center cursor-pointer
        transition-colors ${
          isDragActive
            ? "border-white/50 bg-white/5"
            : "border-white/20 hover:border-white/30"
        }`}
    >
      <input {...getInputProps()} />
      <p className="text-gray-400">
        {isDragActive
          ? "Drop the PDF here"
          : "Drag & drop a PDF file here, or click to select"}
      </p>
    </div>
  );
};
