'use client';

import { useState, useCallback, ReactNode, MouseEvent as ReactMouseEvent, DragEvent as ReactDragEvent } from 'react';
import { 
  Responsive, 
  WidthProvider, 
  Layout as RGLayout, 
  Layouts, 
  ItemCallback as RGItemCallback,
  Layout,
  ResponsiveProps,
  WidthProviderProps,
  ItemCallback as ItemCallbackData
} from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { cn } from '@/lib/utils';
import { DashboardLayout, DashboardProps } from '@/types/dashboard';

const ResponsiveGridLayout = WidthProvider(Responsive);

type Breakpoint = string;
type OnLayoutChangeCallback = (layout: Layout[], layouts: Layouts) => void;

// Define callback types that match react-grid-layout's expected signatures
type ItemCallback = RGItemCallback;
type DropCallback = (
  layout: Layout[],
  item: Layout,
  event: ReactDragEvent
) => void;

type DropDragOverCallback = (event: ReactDragEvent) => { w?: number; h?: number } | boolean;

export interface MatrixDashboardProps extends Omit<DashboardProps, 'onLayoutChange'> {
  onLayoutChange?: OnLayoutChangeCallback;
  useCSSTransforms?: boolean;
}

export function MatrixDashboard({
  initialLayout,
  children,
  className,
  rowHeight = 30,
  breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  containerPadding = [16, 16],
  margin = [16, 16],
  isDraggable = true,
  isResizable = true,
  compactType = null,
  preventCollision = false,
  useCSSTransforms = true,
  onLayoutChange,
  onBreakpointChange,
  onWidthChange,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
  onDrop,
  onDropDragOver,
}: MatrixDashboardProps) {
  const [layouts, setLayouts] = useState<Layouts>(initialLayout as unknown as Layouts);
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  const handleLayoutChange = useCallback<OnLayoutChangeCallback>(
    (layout, allLayouts) => {
      setLayouts(allLayouts);
      onLayoutChange?.(layout, allLayouts);
    },
    [onLayoutChange]
  );

  const handleBreakpointChange = useCallback(
    (newBreakpoint: string, newCols: number) => {
      setCurrentBreakpoint(newBreakpoint);
      onBreakpointChange?.(newBreakpoint, newCols);
    },
    [onBreakpointChange]
  );

    // Event handlers with proper type safety and type assertions
  const handleDragStart = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onDragStart?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onDragStart]
  );

  const handleDrag = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onDrag?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onDrag]
  );

  const handleDragStop = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onDragStop?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onDragStop]
  );

  const handleResizeStart = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onResizeStart?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onResizeStart]
  );

  const handleResize = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onResize?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onResize]
  );

  const handleResizeStop = useCallback<ItemCallback>(
    (layout, oldItem, newItem, placeholder, event, element) => {
      const mouseEvent = event as unknown as ReactMouseEvent<HTMLElement>;
      onResizeStop?.(layout, oldItem, newItem, placeholder, mouseEvent, element);
    },
    [onResizeStop]
  );

  // Drop handlers with proper typing
  const handleDrop = useCallback<DropCallback>(
    (layout, item, event) => {
      const dragEvent = event as unknown as ReactDragEvent<HTMLElement>;
      onDrop?.(layout, item, dragEvent);
    },
    [onDrop]
  );
  
  const handleDropDragOver = useCallback<DropDragOverCallback>(
    (event) => {
      const dragEvent = event as unknown as ReactDragEvent<HTMLElement>;
      return onDropDragOver?.(dragEvent) ?? true;
    },
    [onDropDragOver]
  );

  return (
    <div className={cn('w-full h-full', className)}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={rowHeight}
        containerPadding={containerPadding}
        margin={margin}
        onLayoutChange={handleLayoutChange}
        onBreakpointChange={handleBreakpointChange}
        onWidthChange={onWidthChange}
        isDraggable={isDraggable}
        isResizable={isResizable}
        draggableHandle=".drag-handle"
        draggableCancel=".no-drag"
        compactType={compactType}
        preventCollision={preventCollision}
        useCSSTransforms={useCSSTransforms}
        onDragStart={handleDragStart as any}
        onDrag={handleDrag as any}
        onDragStop={handleDragStop as any}
        onResizeStart={handleResizeStart as any}
        onResize={handleResize as any}
        onResizeStop={handleResizeStop as any}
        onDrop={handleDrop as any}
        onDropDragOver={handleDropDragOver as any}
      >
        {children}
      </ResponsiveGridLayout>
    </div>
  );
}

interface DashboardCardProps {
  id: string;
  title: string;
  className?: string;
  children: ReactNode;
  showHeader?: boolean;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRefresh?: () => void;
  isDraggable?: boolean;
}

export function DashboardCard({
  id,
  title,
  className,
  children,
  showHeader = true,
  onRemove,
  onEdit,
  onRefresh,
  isDraggable = true,
}: DashboardCardProps) {
  return (
    <div className={cn('h-full w-full bg-card rounded-lg border border-border shadow-sm overflow-hidden', className)}>
      {showHeader && (
        <div 
          className={cn(
            'flex items-center justify-between px-4 py-3 border-b border-border',
            isDraggable ? 'cursor-move' : 'cursor-default'
          )}
          data-grid-draggable={isDraggable}
        >
          <h3 className="text-sm font-medium text-foreground flex items-center">
            {isDraggable && (
              <span className="drag-handle mr-2 text-muted-foreground hover:text-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5Z" fill="currentColor" />
                  <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" fill="currentColor" />
                  <path d="M13 20C13 20.5523 12.5523 21 12 21C11.4477 21 11 20.5523 11 20C11 19.4477 11.4477 19 12 19C12.5523 19 13 19.4477 13 20Z" fill="currentColor" />
                  <path d="M20 5C20.5523 5 21 4.55228 21 4C21 3.44772 20.5523 3 20 3C19.4477 3 19 3.44772 19 4C19 4.55228 19.4477 5 20 5Z" fill="currentColor" />
                  <path d="M21 12C21 12.5523 20.5523 13 20 13C19.4477 13 19 12.5523 19 12C19 11.4477 19.4477 11 20 11C20.5523 11 21 11.4477 21 12Z" fill="currentColor" />
                  <path d="M20 21C20.5523 21 21 20.5523 21 20C21 19.4477 20.5523 19 20 19C19.4477 19 19 19.4477 19 20C19 20.5523 19.4477 21 20 21Z" fill="currentColor" />
                  <path d="M5 5C5.55228 5 6 4.55228 6 4C6 3.44772 5.55228 3 5 3C4.44772 3 4 3.44772 4 4C4 4.55228 4.44772 5 5 5Z" fill="currentColor" />
                  <path d="M6 12C6 12.5523 5.55228 13 5 13C4.44772 13 4 12.5523 4 12C4 11.4477 4.44772 11 5 11C5.55228 11 6 11.4477 6 12Z" fill="currentColor" />
                  <path d="M5 21C5.55228 21 6 20.5523 6 20C6 19.4477 5.55228 19 5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21Z" fill="currentColor" />
                </svg>
              </span>
            )}
            {title}
          </h3>
          <div className="flex items-center space-x-1">
            {onRefresh && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                title="Refresh"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4V9H4.58152M19.9381 11C19.486 7.05369 16.1402 4 12.0528 4C8.15001 4 4.96053 6.7659 4.58152 10.5M4.58152 9H9M20 20V15H19.4185M19.4185 15C19.1802 16.669 18.3566 18.1474 17.18 19.2019M19.4185 15H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(id);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted"
                title="Edit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4V11H11V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 13H13V20H20V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 13H4V20H11V13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 4H13V11H20V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-muted"
                title="Remove"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      <div className="p-4 h-full overflow-auto">
        {children}
      </div>
    </div>
  );
}
