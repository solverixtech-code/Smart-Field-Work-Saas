import React, { useEffect, useState, useRef, useId } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = "max-w-lg",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!rendered || !isOpen) return;
    const previous = document.activeElement;
    const selector =
      'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]';
    (
      dialogRef.current?.querySelector<HTMLElement>(selector) ??
      dialogRef.current
    )?.focus();
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const elements = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(selector) ?? [],
      );
      const first = elements.at(0),
        last = elements.at(-1);
      if (!first) {
        event.preventDefault();
        dialogRef.current?.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === dialogRef.current)
      ) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      if (previous instanceof HTMLElement && previous.isConnected)
        previous.focus();
    };
  }, [rendered, isOpen]);
  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-250 ease-out ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Full Viewport Dark Backdrop (dims top header, sidebar, and main content evenly) */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250"
        onClick={onClose}
      />

      {/* Centered Modal Card with Smooth Scale & Translate Transition */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        tabIndex={-1}
        className={`relative w-full ${maxWidth} rounded-xl bg-white p-6 shadow-sm space-y-5 my-8 z-10 transition-all duration-250 ease-out ${
          visible
            ? "scale-100 translate-y-0 opacity-100"
            : "scale-95 translate-y-4 opacity-0"
        }`}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2
              id={titleId}
              className="text-base font-extrabold text-[#0D1F3D]"
            >
              {title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Close dialog"
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 rounded-xl p-1 text-xs font-bold"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
};
