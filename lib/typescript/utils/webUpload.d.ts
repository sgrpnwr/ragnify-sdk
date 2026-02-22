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
export declare function uploadPdfWeb({ file, baseUrl, getHeaders, setCurrentFileKey, setUploadStatus, setUploadProgress, setUploading, showAlert, pollFileStatus, onNavigateToError, }: UploadPdfWebParams): Promise<void>;
export {};
//# sourceMappingURL=webUpload.d.ts.map