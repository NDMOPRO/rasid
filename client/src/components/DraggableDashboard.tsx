/**
 * DraggableDashboard — Drag-and-drop dashboard grid layout.
 * Allows users to rearrange, resize, and customize dashboard widgets.
 * Pure implementation without react-grid-layout dependency.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardWidget {
  id: string;
  title: string;
  titleAr?: string;
  component: React.ReactNode;
  /** Grid columns span (1-12) */
  colSpan?: number;
  /** Grid rows span */
  rowSpan?: number;
  /** Minimum column span */
  minColSpan?: number;
  /** Whether the widget can be hidden */
  removable?: boolean;
}

interface WidgetPosition {
  id: string;
  order: number;
  colSpan: number;
  rowSpan: number;
  visible: boolean;
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[];
  className?: string;
  columns?: number;
  gap?: number;
  editable?: boolean;
  storageKey?: string;
  onLayoutChange?: (positions: WidgetPosition[]) => void;
}

export function DraggableDashboard({
  widgets,
  className,
  columns = 12,
  gap = 16,
  editable = true,
  storageKey = "rasid-dashboard-layout",
  onLayoutChange,
}: DraggableDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [positions, setPositions] = useState<WidgetPosition[]>(() => {
    // Load saved layout
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default positions
    return widgets.map((w, i) => ({
      id: w.id,
      order: i,
      colSpan: w.colSpan || 6,
      rowSpan: w.rowSpan || 1,
      visible: true,
    }));
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Save layout changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(positions));
      onLayoutChange?.(positions);
    } catch {}
  }, [positions, storageKey, onLayoutChange]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, [isEditing]);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setPositions((prev) => {
      const newPositions = [...prev];
      const dragIdx = newPositions.findIndex((p) => p.id === draggedId);
      const targetIdx = newPositions.findIndex((p) => p.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;

      // Swap orders
      const dragOrder = newPositions[dragIdx].order;
      newPositions[dragIdx].order = newPositions[targetIdx].order;
      newPositions[targetIdx].order = dragOrder;
      return newPositions.sort((a, b) => a.order - b.order);
    });

    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  }, []);

  const resizeWidget = useCallback((id: string, colSpan: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, colSpan: Math.min(columns, Math.max(3, colSpan)) } : p))
    );
  }, [columns]);

  const resetLayout = useCallback(() => {
    setPositions(
      widgets.map((w, i) => ({
        id: w.id,
        order: i,
        colSpan: w.colSpan || 6,
        rowSpan: w.rowSpan || 1,
        visible: true,
      }))
    );
  }, [widgets]);

  const sortedPositions = [...positions].sort((a, b) => a.order - b.order);
  const widgetMap = new Map(widgets.map((w) => [w.id, w]));

  return (
    <div className={cn("relative", className)} dir="rtl">
      {/* Edit controls */}
      {editable && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              isEditing
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            )}
          >
            {isEditing ? "✓ حفظ التخطيط" : "⚙ تخصيص اللوحة"}
          </button>
          {isEditing && (
            <button
              onClick={resetLayout}
              className="px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
            >
              ↺ إعادة تعيين
            </button>
          )}
        </div>
      )}

      {/* Hidden widgets toggle (when editing) */}
      {isEditing && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedPositions
            .filter((p) => !p.visible)
            .map((p) => {
              const widget = widgetMap.get(p.id);
              if (!widget) return null;
              return (
                <button
                  key={p.id}
                  onClick={() => toggleWidgetVisibility(p.id)}
                  className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 border border-dashed border-white/20 hover:bg-white/10"
                >
                  + {widget.titleAr || widget.title}
                </button>
              );
            })}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {sortedPositions
          .filter((p) => p.visible)
          .map((pos) => {
            const widget = widgetMap.get(pos.id);
            if (!widget) return null;
            const isDragging = draggedId === pos.id;
            const isDragOver = dragOverId === pos.id;

            return (
              <div
                key={pos.id}
                className={cn(
                  "relative rounded-xl transition-all duration-200",
                  isEditing && "cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-50 scale-95",
                  isDragOver && "ring-2 ring-cyan-500/50",
                  !isEditing && "cursor-default"
                )}
                style={{
                  gridColumn: `span ${pos.colSpan} / span ${pos.colSpan}`,
                }}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, pos.id)}
                onDragOver={(e) => handleDragOver(e, pos.id)}
                onDrop={(e) => handleDrop(e, pos.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Edit overlay */}
                {isEditing && (
                  <div className="absolute top-2 left-2 z-20 flex gap-1">
                    {widget.removable !== false && (
                      <button
                        onClick={() => toggleWidgetVisibility(pos.id)}
                        className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center hover:bg-red-500/40"
                      >
                        ×
                      </button>
                    )}
                    <button
                      onClick={() => resizeWidget(pos.id, pos.colSpan === columns ? (widget.minColSpan || 4) : columns)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/60 text-xs flex items-center justify-center hover:bg-white/20"
                    >
                      ⤢
                    </button>
                  </div>
                )}
                {widget.component}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default DraggableDashboard;
