import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/** Shared anchored filter popover rendered outside cards/scroll containers. */
export default function FilterPanelLayer({
  anchorRef,
  onClose,
  width = 560,
  children,
}) {
  const panelRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const panelWidth = Math.min(width, window.innerWidth - 32);
      const left = Math.max(16, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 16));
      const estimatedHeight = panelRef.current?.offsetHeight || 420;
      const top = Math.max(12, Math.min(rect.bottom + 8, window.innerHeight - estimatedHeight - 12));

      setPosition({ top, left });
    };

    updatePosition();
    const observer = panelRef.current ? new ResizeObserver(updatePosition) : null;
    if (observer && panelRef.current) observer.observe(panelRef.current);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, width]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        anchorRef?.current?.contains(event.target) ||
        event.target.closest?.('[data-filter-panel-portal]')
      ) return;
      onClose?.();
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [anchorRef, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1000] bg-black/10 sm:bg-transparent" aria-hidden="true" />
      <div
        ref={panelRef}
        className="fixed z-[1001]"
        style={{ top: position.top, left: position.left, width: `min(${width}px, calc(100vw - 32px))` }}
      >
        {children}
      </div>
    </>,
    document.body
  );
}
