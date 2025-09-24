import { 
  Layout as RGLayout, 
  Layouts,
  ItemCallback as RGItemCallback,
  Layout,
  ResponsiveProps
} from 'react-grid-layout';
import { 
  MouseEvent as ReactMouseEvent, 
  DragEvent as ReactDragEvent, 
  ReactNode as ReactNode 
} from 'react';

export interface DashboardItem extends RGLayout {
  id: string;
  title: string;
  component: ReactNode;
  isResizable?: boolean;
  isDraggable?: boolean;
  static?: boolean;
}

export type DashboardLayout = Layouts;

type ItemCallback = (
  layout: Layout[],
  oldItem: Layout,
  newItem: Layout,
  placeholder: Layout,
  event: ReactMouseEvent<HTMLElement>,
  element: HTMLElement
) => void;

// Define callback types that match react-grid-layout's expected signatures
type DropCallback = (
  layout: Layout[],
  item: Layout,
  event: ReactDragEvent
) => void;

type DropDragOverCallback = (event: ReactDragEvent) => { w?: number; h?: number } | boolean;

export interface DashboardProps {
  initialLayout: DashboardLayout;
  children?: ReactNode;
  className?: string;
  rowHeight?: number;
  breakpoints?: { [key: string]: number };
  cols?: { [key: string]: number };
  containerPadding?: [number, number];
  margin?: [number, number];
  onLayoutChange?: (layout: Layout[], allLayouts: Layouts) => void;
  // Layout and interaction callbacks
  onBreakpointChange?: (newBreakpoint: string, newCols: number) => void;
  onWidthChange?: (containerWidth: number, margin: [number, number], cols: number, containerPadding: [number, number]) => void;
  onDragStart?: ItemCallback;
  onDrag?: ItemCallback;
  onDragStop?: ItemCallback;
  onResizeStart?: ItemCallback;
  onResize?: ItemCallback;
  onResizeStop?: ItemCallback;
  onDrop?: DropCallback;
  onDropDragOver?: DropDragOverCallback;
  
  // Grid layout properties
  isDraggable?: boolean;
  isResizable?: boolean;
  compactType?: 'vertical' | 'horizontal' | null;
  preventCollision?: boolean;
}

export interface DashboardCardProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  onRemove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onRefresh?: () => void;
  isDraggable?: boolean;
}
