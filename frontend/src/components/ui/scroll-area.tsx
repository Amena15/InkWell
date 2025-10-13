import * as React from "react"
import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    children?: React.ReactNode
  }
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative overflow-auto", 
      "max-h-[calc(100vh-2rem)]", // Default max height
      className
    )}
    style={{ scrollbarWidth: 'thin', scrollbarColor: '#c7d2fe transparent' }}
    {...props}
  >
    <div className="min-w-[inherit]">
      {children}
    </div>
    {/* Custom scrollbar styling */}
    <style jsx>{`
      div:global(overflow-auto)::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      div:global(overflow-auto)::-webkit-scrollbar-track {
        background: transparent;
      }
      div:global(overflow-auto)::-webkit-scrollbar-thumb {
        background-color: #c7d2fe;
        border-radius: 4px;
      }
      div:global(overflow-auto):hover::-webkit-scrollbar-thumb {
        background-color: #a5b4fc;
      }
    `}</style>
  </div>
))
ScrollArea.displayName = "ScrollArea"

// Simple scroll bar implementation
const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    orientation?: "vertical" | "horizontal" 
  }
>(({ className, orientation = "vertical", ...props }, ref) => (
  <div 
    ref={ref}
    className={cn(
      "absolute inset-0 pointer-events-none",
      orientation === "vertical" ? "right-0 top-0 w-2" : "bottom-0 left-0 h-2",
      className
    )}
    {...props}
  />
))
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
