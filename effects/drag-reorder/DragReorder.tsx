import { useState, useRef, useCallback } from "react";
import { useGesture } from "../../hooks";

interface DragReorderProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onReorder: (newItems: T[]) => void;
  itemHeight?: number;
  className?: string;
}

interface DragState {
  active: boolean;
  originIndex: number;
  currentIndex: number;
  offsetY: number;
}

const NULL_DRAG: DragState = {
  active: false,
  originIndex: -1,
  currentIndex: -1,
  offsetY: 0,
};

export default function DragReorder<T>({
  items,
  renderItem,
  onReorder,
  itemHeight = 60,
  className = "",
}: DragReorderProps<T>) {
  const [dragState, setDragState] = useState<DragState>(NULL_DRAG);
  const dragRef = useRef<DragState>(NULL_DRAG);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const startDrag = useCallback((index: number) => {
    const state: DragState = { active: true, originIndex: index, currentIndex: index, offsetY: 0 };
    dragRef.current = state;
    setDragState(state);
  }, []);

  const gesture = useGesture({
    onDragMove: (s) => {
      if (!dragRef.current.active) return;
      const newIndex = Math.max(
        0,
        Math.min(
          itemsRef.current.length - 1,
          dragRef.current.originIndex + Math.round(s.dy / itemHeight),
        ),
      );
      const state: DragState = {
        ...dragRef.current,
        currentIndex: newIndex,
        offsetY: s.dy,
      };
      dragRef.current = state;
      setDragState({ ...state });
    },
    onDragEnd: () => {
      if (!dragRef.current.active) return;
      const { originIndex, currentIndex } = dragRef.current;
      if (originIndex !== currentIndex) {
        const next = [...itemsRef.current];
        const [moved] = next.splice(originIndex, 1);
        next.splice(currentIndex, 0, moved);
        onReorder(next);
      }
      dragRef.current = NULL_DRAG;
      setDragState(NULL_DRAG);
    },
  });

  const getTranslateY = (index: number): number => {
    if (!dragState.active) return 0;
    const { originIndex, currentIndex } = dragState;
    if (index === originIndex) return dragState.offsetY;
    // shift items that are displaced by the dragged item
    if (originIndex < currentIndex) {
      if (index > originIndex && index <= currentIndex) return -itemHeight;
    } else {
      if (index >= currentIndex && index < originIndex) return itemHeight;
    }
    return 0;
  };

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ height: items.length * itemHeight }}
    >
      {items.map((item, i) => {
        const isDragging = dragState.active && i === dragState.originIndex;
        const translateY = getTranslateY(i);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
              transform: `translateY(${translateY}px) scale(${isDragging ? 1.03 : 1})`,
              transition: isDragging
                ? "transform 0.05s ease, box-shadow 0.2s ease"
                : "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease",
              zIndex: isDragging ? 10 : 1,
              boxShadow: isDragging
                ? "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)"
                : "none",
              cursor: isDragging ? "grabbing" : "grab",
            }}
            {...(i === dragState.originIndex || !dragState.active
              ? {
                  onPointerDown: (e) => {
                    startDrag(i);
                    gesture.handlers.onPointerDown(e);
                  },
                  onPointerMove: gesture.handlers.onPointerMove,
                  onPointerUp: gesture.handlers.onPointerUp,
                  style: {
                    position: "absolute" as const,
                    top: i * itemHeight,
                    left: 0,
                    right: 0,
                    height: itemHeight,
                    transform: `translateY(${translateY}px) scale(${isDragging ? 1.03 : 1})`,
                    transition: isDragging
                      ? "transform 0.05s ease, box-shadow 0.2s ease"
                      : "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease",
                    zIndex: isDragging ? 10 : 1,
                    boxShadow: isDragging
                      ? "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)"
                      : "none",
                    cursor: isDragging ? "grabbing" : "grab",
                    touchAction: "none",
                  },
                }
              : {})}
          >
            {renderItem(item, i)}
          </div>
        );
      })}
    </div>
  );
}
