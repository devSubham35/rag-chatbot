"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, UploadCloud } from "lucide-react";
import { processPdfFile } from "./action";
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

export default function PDFUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

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
    <main className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-4xl items-center px-3 py-8 sm:px-4 sm:py-10">
      <section className="w-full space-y-5">
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

        <Card className="border-border/80 bg-card/80 shadow-sm">
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
      </section>
    </main>
  );
}
