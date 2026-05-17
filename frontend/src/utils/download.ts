export function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function downloadTextFile(content: string, filename: string, contentType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: contentType });
  downloadBlob(blob, filename);
}
