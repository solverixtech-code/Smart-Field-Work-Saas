import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

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
  align?: 'right' | 'left';
}

export const RowActionsMenu: React.FC<RowActionsMenuProps> = ({
  items,
  triggerIcon: TriggerIcon = MoreVertical,
  triggerClassName = 'p-1.5 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={menuRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName}
        title="More Actions"
      >
        <TriggerIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1 z-[99999] w-48 rounded-sm border border-slate-200 bg-white py-1 shadow-xl text-xs font-semibold animate-in fade-in zoom-in-95 duration-150`}
        >
          {items.map((item, idx) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={idx}>
                {item.divider && <div className="my-1 border-t border-slate-100" />}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left transition-colors cursor-pointer ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]'
                  }`}
                >
                  {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${item.danger ? 'text-red-500' : 'text-slate-400'}`} />}
                  <span className="truncate">{item.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
