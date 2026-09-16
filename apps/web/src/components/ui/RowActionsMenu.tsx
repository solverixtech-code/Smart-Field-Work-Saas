import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreVertical } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface RowActionsMenuProps {
  items: ActionMenuItem[];
  triggerIcon?: React.ElementType;
  triggerClassName?: string;
  align?: "right" | "left";
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({
  items,
  triggerIcon: TriggerIcon = MoreVertical,
  triggerClassName = "p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors",
  align = "right",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 192; // w-48 = 12rem = 192px
    const estimatedHeight = items.length * 36 + 16; // approximate menu height

    let left = align === "right" ? rect.right - menuWidth : rect.left;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    if (left < 8) left = 8;

    let top = rect.bottom + 4;
    if (
      top + estimatedHeight > window.innerHeight - 8 &&
      rect.top - estimatedHeight > 8
    ) {
      top = rect.top - estimatedHeight - 4;
    }

    setCoords({ top, left });
  };

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    menuRef.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();

    const handleOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  return (
    <div className="inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleMenu}
        className={triggerClassName}
        title="More Actions"
        aria-label="More Actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            updatePosition();
            setIsOpen(true);
          }
        }}
      >
        <TriggerIcon className="h-4 w-4" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label="Row actions"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
                triggerRef.current?.focus();
                return;
              }
              const options = Array.from(
                e.currentTarget.querySelectorAll<HTMLButtonElement>(
                  '[role="menuitem"]',
                ),
              );
              const index = options.findIndex(
                (o) => o === document.activeElement,
              );
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                options[
                  (index + (e.key === "ArrowDown" ? 1 : options.length - 1)) %
                    options.length
                ]?.focus();
              }
              if (e.key === "Home" || e.key === "End") {
                e.preventDefault();
                options.at(e.key === "Home" ? 0 : -1)?.focus();
              }
              if (e.key === "Tab") setIsOpen(false);
            }}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 999999,
            }}
            className="w-48 rounded-lg border border-slate-200 bg-white py-1.5 shadow-sm text-xs font-semibold animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, idx) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={idx}>
                  {item.divider && (
                    <div className="my-1 border-t border-slate-100" />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      item.onClick();
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer ${
                      item.danger
                        ? "text-red-600 hover:bg-red-50"
                        : "text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${item.danger ? "text-red-500" : "text-slate-400"}`}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
