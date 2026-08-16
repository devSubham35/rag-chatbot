"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { getUploadedDocuments, processPdfFile } from "./action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type UploadedDocument = {
  id: string;
  name: string;
  chunkCount: number;
  uploadedAt: string;
};

export default function PDFUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadedDocument[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const loadUploads = async () => {
    setIsHistoryLoading(true);

    try {
      const history = await getUploadedDocuments();
      setUploads(history);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUploads();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file.name);
    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("pdf", file);

      const result = await processPdfFile(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text: result.chunks
            ? `${result.message || "PDF processed successfully"} (${result.chunks} chunks indexed)`
            : result.message || "PDF processed successfully",
        });
        await loadUploads();
        e.target.value = "";
        setSelectedFile(null);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to process PDF",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "An error occurred while processing the PDF",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex h-[calc(100svh-4rem)] min-h-0 w-full overflow-hidden">
      <aside className="hidden h-full min-h-0 w-72 shrink-0 flex-col border-r bg-background md:flex">
        <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
          <p className="text-sm font-semibold">Uploaded documents</p>
          <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
            {uploads.length}
          </span>
        </div>

        <div className="scrollbar-none min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {isHistoryLoading ? (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading uploads
            </div>
          ) : uploads.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <div className="space-y-1">
              {uploads.map((upload) => (
                <div
                  className="rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                  key={upload.id}
                >
                  <p className="truncate font-medium">{upload.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{upload.chunkCount} chunks</span>
                    <span>
                      {formatDistanceToNow(new Date(upload.uploadedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <section className="scrollbar-none flex min-w-0 flex-1 items-center overflow-y-auto overflow-x-hidden px-3 py-6 sm:px-4 sm:py-8">
        <div className="mx-auto w-full max-w-4xl min-w-0 space-y-5">
        <div className="rounded-lg border bg-card/60 md:hidden">
          <div className="flex items-center justify-between gap-2 border-b px-3 py-3">
            <p className="text-sm font-semibold">Uploaded documents</p>
            <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
              {uploads.length}
            </span>
          </div>
          <div className="scrollbar-none max-h-48 space-y-1 overflow-y-auto p-2">
            {isHistoryLoading ? (
              <div className="flex items-center gap-2 px-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Loading uploads
              </div>
            ) : uploads.length === 0 ? (
              <p className="px-2 py-3 text-xs text-muted-foreground">
                No documents uploaded yet.
              </p>
            ) : (
              uploads.map((upload) => (
                <div className="rounded-md px-2 py-2 text-sm" key={upload.id}>
                  <p className="truncate font-medium">{upload.name}</p>
                  <div className="mt-1 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{upload.chunkCount} chunks</span>
                    <span>
                      {formatDistanceToNow(new Date(upload.uploadedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1 text-muted-foreground text-xs">
            <FileText className="size-3.5" />
            Document ingestion
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Upload a PDF
          </h1>
          <p className="max-w-2xl text-muted-foreground text-sm leading-6">
            Add a document to your RAG knowledge base. The file will be parsed,
            chunked, embedded, and stored for chat retrieval.
          </p>
        </div>

        <Card className="min-w-0 border-border/80 bg-card/80 shadow-sm">
          <CardHeader>
            <CardTitle>PDF source</CardTitle>
            <CardDescription>
              Choose a searchable PDF with extractable text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Label
                className="group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/50 px-4 py-6 text-center transition-colors hover:bg-muted/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 sm:min-h-56 sm:px-6 sm:py-8"
                htmlFor="pdf-upload"
              >
                <span className="mb-4 flex size-12 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors group-hover:text-foreground">
                  {isLoading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <UploadCloud className="size-5" />
                  )}
                </span>
                <span className="font-medium text-foreground text-sm">
                  {isLoading ? "Processing PDF" : "Select a PDF to upload"}
                </span>
                <span className="mt-1 max-w-md text-muted-foreground text-xs leading-5">
                  {selectedFile || "Only .pdf files are accepted."}
                </span>
                <Input
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  disabled={isLoading}
                  id="pdf-upload"
                  onChange={handleFileUpload}
                  type="file"
                />
              </Label>

              {isLoading && (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-muted-foreground text-xs">
                  <span>Extracting text and generating embeddings</span>
                  <Loader2 className="size-4 animate-spin" />
                </div>
              )}

              {message && (
                <Alert
                  className={
                    message.type === "success"
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : undefined
                  }
                  variant={message.type === "error" ? "destructive" : "default"}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="size-4" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  <AlertTitle>
                    {message.type === "error" ? "Upload failed" : "Upload complete"}
                  </AlertTitle>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-stretch justify-between gap-3 border-t border-border pt-4 sm:flex-row sm:items-center">
                <p className="text-muted-foreground text-xs">
                  Large PDFs can take a moment while embeddings are generated.
                </p>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isLoading}
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  <UploadCloud className="size-4" />
                  Choose PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </section>
    </main>
  );
}
