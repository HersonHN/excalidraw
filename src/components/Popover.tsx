import React, { useLayoutEffect, useRef, useEffect } from "react";
import "./Popover.css";
import { unstable_batchedUpdates } from "react-dom";

import useGetWindow from "../window";

type Props = {
  top?: number;
  left?: number;
  children?: React.ReactNode;
  onCloseRequest?(event: PointerEvent): void;
  fitInViewport?: boolean;
};

export const Popover = ({
  children,
  left,
  top,
  onCloseRequest,
  fitInViewport = false,
}: Props) => {
  const window = useGetWindow();
  const popoverRef = useRef<HTMLDivElement>(null);

  // ensure the popover doesn't overflow the viewport
  useLayoutEffect(() => {
    if (fitInViewport && popoverRef.current) {
      const element = popoverRef.current;
      const { x, y, width, height } = element.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      if (x + width > viewportWidth) {
        element.style.left = `${viewportWidth - width}px`;
      }
      const viewportHeight = window.innerHeight;
      if (y + height > viewportHeight) {
        element.style.top = `${viewportHeight - height}px`;
      }
    }
  }, [fitInViewport, window.innerHeight, window.innerWidth]);

  useEffect(() => {
    if (onCloseRequest) {
      const handler = (event: PointerEvent) => {
        if (!popoverRef.current?.contains(event.target as Node)) {
          unstable_batchedUpdates(() => onCloseRequest(event));
        }
      };
      window.document.addEventListener("pointerdown", handler, false);
      return () =>
        window.document.removeEventListener("pointerdown", handler, false);
    }
  }, [onCloseRequest, window.document]);

  return (
    <div className="popover" style={{ top: top, left: left }} ref={popoverRef}>
      {children}
    </div>
  );
};
