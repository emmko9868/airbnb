import { forwardRef, useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, HTMLAttributes, ReactNode } from "react";
import "./FileUploader.css";
import { useText } from "../../lib/i18n";

export type FileUploaderSize = "sm" | "md" | "lg";
export type FileUploaderVariant = "button" | "dropArea";

export interface UploadedFile {
  id: string;
  name: string;
  size?: number;
  status?: "uploading" | "done" | "error";
  message?: string;
}

export interface FileUploaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Figma: Size */
  size?: FileUploaderSize;
  /** Figma: Variant */
  variant?: FileUploaderVariant;
  /** Figma: Multiple */
  multiple?: boolean;
  /** Figma: Disabled */
  disabled?: boolean;
  label?: string;
  helperText?: string;
  accept?: string;
  /** The file list (controlled). If you pass it, you must update it yourself in onFilesAdd and onFileRemove. */
  files?: UploadedFile[];
  /** The starting file list (uncontrolled). Chosen files are added as "Done" and removed with ×. */
  defaultFiles?: UploadedFile[];
  onFilesAdd?: (files: File[]) => void;
  onFileRemove?: (id: string) => void;
  children?: ReactNode;
}

function readableSize(bytes?: number) {
  if (bytes === undefined) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let u = 0;
  while (n >= 1024 && u < units.length - 1) {
    n /= 1024;
    u += 1;
  }
  return `${n.toFixed(u === 0 ? 0 : 1)}${units[u]}`;
}

/**
 * A control for choosing and uploading files.
 *
 * **A drop area on its own is not enough.** Dragging only works with a mouse, so keyboard users could not add files.
 * That is why the dropArea variant also has a real `label`+`input[type=file]` button inside it.
 * Progress and failure are read out through `aria-live` — a color change in the list alone does not get the message across.
 */
export const FileUploader = forwardRef<HTMLDivElement, FileUploaderProps>(function FileUploader(
  { size = "md", variant = "button", multiple = false, disabled = false, label: labelProp, helperText, accept, files: filesProp, defaultFiles = [], onFilesAdd, onFileRemove, className, children, ...rest },
  ref,
) {
  const t = useText();
  const label = labelProp ?? t.chooseFile;
  const base = useId();
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);

  const [inner, setInner] = useState(defaultFiles);
  const files = filesProp ?? inner;
  const take = (list: FileList | null) => {
    if (!list?.length) return;
    const picked = Array.from(list);
    if (filesProp === undefined) {
      const added = picked.map((f, i) => ({ id: `${Date.now()}-${i}-${f.name}`, name: f.name, size: f.size, status: "done" as const }));
      setInner((prev) => (multiple ? [...prev, ...added] : added));
    }
    onFilesAdd?.(picked);
  };
  const remove = (id: string) => {
    if (filesProp === undefined) setInner((prev) => prev.filter((f) => f.id !== id));
    onFileRemove?.(id);
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    take(e.target.files);
    // 같은 파일을 다시 고를 수 있게 비운다.
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    take(e.dataTransfer.files);
  };

  const helpId = `${base}-help`;
  const classes = [
    "ds-fileuploader",
    `ds-fileuploader--${size}`,
    `ds-fileuploader--${variant}`,
    dragging && "ds-fileuploader--dragging",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const picker = (
    <>
      <input
        id={`${base}-input`}
        ref={input}
        type="file"
        className="ds-fileuploader__input"
        multiple={multiple}
        accept={accept}
        disabled={disabled}
        aria-describedby={helperText ? helpId : undefined}
        onChange={onChange}
      />
      <label className="ds-fileuploader__button" htmlFor={`${base}-input`}>
        {label}
      </label>
    </>
  );

  return (
    <div ref={ref} className={classes} data-testid="ds-fileuploader" {...rest}>
      {variant === "dropArea" ? (
        <div
          className="ds-fileuploader__drop"
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <p className="ds-fileuploader__hint">{t.dropHint}</p>
          {picker}
        </div>
      ) : (
        picker
      )}

      {helperText ? <span id={helpId} className="ds-fileuploader__help">{helperText}</span> : null}

      {files.length ? (
        <ul className="ds-fileuploader__list">
          {files.map((file) => (
            <li key={file.id} className="ds-fileuploader__file" data-status={file.status ?? "done"}>
              <span className="ds-fileuploader__name">{file.name}</span>
              {file.size !== undefined ? <span className="ds-fileuploader__size">{readableSize(file.size)}</span> : null}
              <span className="ds-fileuploader__status">
                {file.status === "uploading" ? t.uploading : file.status === "error" ? (file.message ?? t.failed) : t.done}
              </span>
              <button
                type="button"
                className="ds-fileuploader__remove"
                onClick={() => remove(file.id)}
                aria-label={t.remove(file.name)}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {/* 진행·실패를 소리로도 알린다. */}
      <span className="ds-fileuploader__sr" role="status" aria-live="polite">
        {files.length ? t.fileSummary(files.length, files.filter((f) => f.status === "error").length) : ""}
      </span>
      {children}
    </div>
  );
});
