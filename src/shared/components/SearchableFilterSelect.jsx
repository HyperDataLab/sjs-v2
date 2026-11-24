import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@iconify/react';

/** Search field occupies the select control; the popup contains options only. */
export default function SearchableFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  disabled = false,
  active,
  className = '',
}) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState(null);

  const selectedOption = options.find((option) => String(option.value) === String(value));
  const hasActiveValue = active ?? (value !== '' && value !== 'all' && value != null);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => String(option.label).toLocaleLowerCase().includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target) && !menuRef.current?.contains(event.target)) {
        setIsOpen(false);
        setQuery('');
        setMenuPosition(null);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setMenuPosition(null);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return undefined;

    const updatePosition = () => {
      const anchor = rootRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportPadding = 8;
      const menuHeight = menuRef.current?.offsetHeight || Math.min(224, filteredOptions.length * 36 + 2);
      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding;
      const spaceAbove = rect.top - viewportPadding;
      const placeAbove = spaceBelow < Math.min(menuHeight, 160) && spaceAbove > spaceBelow;
      const availableHeight = Math.max(96, Math.min(224, placeAbove ? spaceAbove : spaceBelow));
      const height = Math.min(menuHeight, availableHeight);
      const left = Math.max(viewportPadding, Math.min(rect.left, window.innerWidth - rect.width - viewportPadding));
      const top = placeAbove
        ? Math.max(viewportPadding, rect.top - height)
        : Math.min(rect.bottom, window.innerHeight - height - viewportPadding);

      setMenuPosition({ top, left, width: rect.width, maxHeight: availableHeight });
    };

    updatePosition();
    const observer = menuRef.current ? new ResizeObserver(updatePosition) : null;
    if (observer && menuRef.current) observer.observe(menuRef.current);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, filteredOptions.length]);

  const chooseOption = (option) => {
    onChange?.(option.value);
    setIsOpen(false);
    setQuery('');
    setMenuPosition(null);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {isOpen ? (
        <div className="relative">
          <Icon icon="lucide:search" width={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault();
            }}
            placeholder="Search values..."
            className="w-full h-9 pl-9 pr-9 text-xs rounded-control border border-primary bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => { setIsOpen(false); setQuery(''); setMenuPosition(null); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-none border-0 bg-transparent p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close options"
          >
            <Icon icon="lucide:chevron-up" width={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(true)}
          className={`w-full h-9 pl-3 pr-8 text-xs rounded-control border text-left transition-colors appearance-none ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-surface-muted/50 text-muted-foreground border-border'
              : hasActiveValue
                ? 'border-primary text-primary bg-primary-subtle/50 font-semibold ring-1 ring-primary/20 cursor-pointer'
                : 'border-border bg-surface text-foreground hover:bg-surface-muted/40 cursor-pointer'
          }`}
          aria-expanded={isOpen}
        >
          <span className="block truncate">{selectedOption?.label || placeholder}</span>
          <Icon icon="lucide:chevron-down" width={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </button>
      )}

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          data-filter-panel-portal="true"
          className="fixed z-[1102] border border-border bg-surface shadow-md"
          style={{
            top: menuPosition?.top ?? 0,
            left: menuPosition?.left ?? 0,
            width: menuPosition?.width ?? 0,
            maxHeight: menuPosition?.maxHeight ?? 224,
            visibility: menuPosition ? 'visible' : 'hidden',
          }}
        >
          <div className="overflow-y-auto" style={{ maxHeight: menuPosition?.maxHeight ?? 224 }}>
            {filteredOptions.map((option) => {
              const isSelected = String(option.value) === String(value);
              const isDisabled = Boolean(option.disabled);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => chooseOption(option)}
                  className={`w-full flex items-center px-3 py-2 rounded-none border-0 text-xs text-left transition-colors ${
                    isDisabled
                      ? 'text-muted-foreground/60 cursor-not-allowed bg-surface'
                      : isSelected
                        ? 'bg-[#777] text-white font-semibold cursor-pointer'
                        : 'bg-surface text-foreground hover:bg-surface-muted cursor-pointer'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">No matching options</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
