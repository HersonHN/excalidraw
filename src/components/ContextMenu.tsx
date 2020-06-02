import React from "react";
import { Popover } from "./Popover";
import { render, unmountComponentAtNode } from "react-dom";

import "./ContextMenu.scss";

type ContextMenuOption = {
  label: string;
  action(): void;
};

type Props = {
  options: ContextMenuOption[];
  onCloseRequest?(): void;
  top: number;
  left: number;
  window: Window;
};

const ContextMenu = ({ options, onCloseRequest, top, left, window }: Props) => (
  <Popover
    onCloseRequest={onCloseRequest}
    top={top}
    left={left}
    fitInViewport={true}
    window={window}
  >
    <ul
      className="context-menu"
      onContextMenu={(event) => event.preventDefault()}
    >
      {options.map((option, idx) => (
        <li key={idx} onClick={onCloseRequest}>
          <ContextMenuOption {...option} />
        </li>
      ))}
    </ul>
  </Popover>
);

const ContextMenuOption = ({ label, action }: ContextMenuOption) => (
  <button className="context-menu-option" onClick={action}>
    {label}
  </button>
);

let contextMenuNode: HTMLDivElement;
const getContextMenuNode = (window?: Window): HTMLDivElement => {
  if (contextMenuNode || !window) {
    return contextMenuNode;
  }

  const div = document.createElement("div");
  window.document.body.appendChild(div);
  return (contextMenuNode = div);
};

type ContextMenuParams = {
  options: (ContextMenuOption | false | null | undefined)[];
  top: number;
  left: number;
  window: Window;
};

const handleClose = () => {
  unmountComponentAtNode(getContextMenuNode());
};

export default {
  push(params: ContextMenuParams) {
    const options = Array.of<ContextMenuOption>();
    params.options.forEach((option) => {
      if (option) {
        options.push(option);
      }
    });
    if (options.length) {
      render(
        <ContextMenu
          top={params.top}
          left={params.left}
          options={options}
          onCloseRequest={handleClose}
          window={params.window}
        />,
        getContextMenuNode(params.window),
      );
    }
  },
};
