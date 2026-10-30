"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

export interface VirtualGridOptions {
  totalItems: number;
  estimatedItemHeight: number;
  gap?: number;
  minColumnWidth?: number;
  overscanRows?: number;
}

export interface VirtualItem {
  index: number;
  row: number;
  col: number;
}

export function useVirtualGrid({
  totalItems,
  estimatedItemHeight,
  gap = 16,
  minColumnWidth = 220,
  overscanRows = 2,
}: VirtualGridOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  // Resize observer to track width and viewport height
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setContainerWidth(container.clientWidth || window.innerWidth);
      setViewportHeight(window.innerHeight);
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });

    resizeObserver.observe(container);
    window.addEventListener("resize", updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // Window scroll listener using requestAnimationFrame for 60fps responsiveness
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = containerRef.current;
          if (container) {
            const rect = container.getBoundingClientRect();
            // Distance from top of container to top of viewport
            const topDistance = -rect.top;
            setScrollTop(Math.max(0, topDistance));
            setViewportHeight(window.innerHeight);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Compute column count based on container width
  const columns = useMemo(() => {
    if (containerWidth <= 0) return 1;
    const computed = Math.floor((containerWidth + gap) / (minColumnWidth + gap));
    return Math.max(1, computed);
  }, [containerWidth, gap, minColumnWidth]);

  // Compute total rows and height
  const rowHeight = estimatedItemHeight + gap;
  const totalRows = Math.ceil(totalItems / columns);
  const totalHeight = Math.max(0, totalRows * rowHeight - gap);

  // Calculate visible range of rows with overscan
  const { startRow, endRow } = useMemo(() => {
    if (totalItems === 0 || columns === 0) {
      return { startRow: 0, endRow: 0 };
    }

    const calculatedStart = Math.floor(scrollTop / rowHeight) - overscanRows;
    const calculatedEnd = Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscanRows;

    const clampedStart = Math.max(0, calculatedStart);
    const clampedEnd = Math.min(totalRows - 1, calculatedEnd);

    return {
      startRow: clampedStart,
      endRow: Math.max(clampedStart, clampedEnd),
    };
  }, [scrollTop, viewportHeight, rowHeight, overscanRows, totalRows, totalItems, columns]);

  // Generate virtual items for visible window
  const virtualItems = useMemo(() => {
    if (totalItems === 0) return [];

    const items: VirtualItem[] = [];
    const startIndex = startRow * columns;
    const endIndex = Math.min(totalItems - 1, (endRow + 1) * columns - 1);

    for (let index = startIndex; index <= endIndex; index++) {
      const row = Math.floor(index / columns);
      const col = index % columns;
      items.push({ index, row, col });
    }

    return items;
  }, [startRow, endRow, columns, totalItems]);

  const offsetY = startRow * rowHeight;

  return {
    containerRef,
    columns,
    totalHeight,
    offsetY,
    virtualItems,
    startRow,
    endRow,
    totalRows,
  };
}
