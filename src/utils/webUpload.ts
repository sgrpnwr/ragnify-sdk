// utils/webUpload.ts
// Handles PDF upload for web platform

interface UploadPdfWebParams {
  file: File;
  baseUrl: string;
  getHeaders: () => Record<string, string>;
  setCurrentFileKey: (key: string) => void;
  setUploadStatus: (status: string) => void;
  setUploadProgress: (progress: number) => void;
  setUploading: (uploading: boolean) => void;
  showAlert: (title: string, message: string) => void;
  pollFileStatus: (key: string) => void;
  onNavigateToError?: () => void;
}

export async function uploadPdfWeb({
  file,
  baseUrl,
  getHeaders,
  setCurrentFileKey,
  setUploadStatus,
  setUploadProgress,
  setUploading,
  showAlert,
  pollFileStatus,
  onNavigateToError,
}: UploadPdfWebParams): Promise<void> {
  setUploading(true);
  try {
    const fileName = file.name;
    const fileType = file.type || "application/pdf";
    const resp = await fetch(`${baseUrl}/file/presigned-url`, {
      method: "POST",
      body: JSON.stringify({ fileName, fileType }),
      headers: {
        "Content-Type": "application/json",
        ...getHeaders(),
      },
    });
    if (!resp.ok) {
      throw new Error("Failed to get presigned URL");
    }
    const { uploadUrl, fileUrl, key } = await resp.json();
    void fileUrl;
    const { Authorization, ...headersWithoutAuth } = getHeaders();
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": fileType,
        ...headersWithoutAuth,
      },
      body: file,
    });
    setCurrentFileKey(key);
    setUploadStatus("File uploaded! Processing and generating embeddings...");
    setUploadProgress(0);
    setUploading(false);
    showAlert(
      "Upload Complete!",
      `${file.name} uploaded successfully. Now processing and generating embeddings...`,
    );
    // Send upload-success event to file-service
      await fetch(`${baseUrl}/file/upload-success`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders(),
        },
        body: JSON.stringify({ key }),
      });
    pollFileStatus(key);
  } catch (error: unknown) {
    let errorMsg = "Failed to upload file";
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as any).message === "string"
    ) {
      errorMsg = (error as any).message;
    }
    showAlert("Error", errorMsg);
    setUploading(false);
    if (
      errorMsg.toLowerCase().includes("network") ||
      errorMsg.toLowerCase().includes("fetch") ||
      errorMsg.toLowerCase().includes("presign request failed")
    ) {
      setTimeout(() => {
        if (onNavigateToError) onNavigateToError();
      }, 2000);
    }
  }
}
