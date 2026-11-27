import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { createProgressExport, mergeProgressImport } from "../../lib/progressTransfer";
import { toast } from "../../store/toast";

const MAX_IMPORT_SIZE = 2 * 1024 * 1024;

export function ProgressTransfer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const exportProgress = () => {
    try {
      const file = new Blob([JSON.stringify(createProgressExport(), null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `engineering-in-kannada-progress-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      toast("Progress exported successfully", "success");
    } catch {
      toast("Unable to export progress. Please try again.", "error");
    }
  };

  const importProgress = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_IMPORT_SIZE) {
      toast("That backup file is too large to import.", "error");
      return;
    }

    setBusy(true);
    try {
      const content = await file.text();
      mergeProgressImport(JSON.parse(content) as unknown);
      toast("Progress imported and merged successfully", "success");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Unable to import this progress file.", "error");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <section
      className="card flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      aria-labelledby="progress-transfer-title"
    >
      <div>
        <h2 id="progress-transfer-title" className="text-lg font-bold text-white">
          Switching devices?
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-neutral-400 sm:text-base">
          Export your progress and import it on another browser. Imports are merged, nothing is lost.
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={exportProgress} className="btn-secondary" disabled={busy}>
          <Download className="h-4 w-4" /> Export
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="btn-secondary"
          disabled={busy}
        >
          <Upload className="h-4 w-4" /> {busy ? "Importing…" : "Import"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="sr-only"
          aria-label="Choose a progress backup file"
          onChange={(event) => void importProgress(event.currentTarget.files?.[0])}
        />
      </div>
    </section>
  );
}
