import React from "react";
import {
  Action,
  ActionsManagerInterface,
  UpdaterFn,
  ActionFilterFn,
  ActionName,
} from "./types";
import { ExcalidrawElement } from "../element/types";
import { AppState } from "../types";
import { t } from "../i18n";
import { globalSceneState } from "../scene";

export class ActionManager implements ActionsManagerInterface {
  actions = {} as ActionsManagerInterface["actions"];

  updater: UpdaterFn;

  getAppState: () => AppState;

  getElementsIncludingDeleted: () => readonly ExcalidrawElement[];

  window: Window;
  canvas: () => HTMLCanvasElement | null;

  constructor(
    updater: UpdaterFn,
    getAppState: () => AppState,
    getElementsIncludingDeleted: () => ReturnType<
      typeof globalSceneState["getElementsIncludingDeleted"]
    >,
    window: Window,
    canvas: () => HTMLCanvasElement | null,
  ) {
    this.updater = updater;
    this.getAppState = getAppState;
    this.getElementsIncludingDeleted = getElementsIncludingDeleted;
    this.window = window;
    this.canvas = canvas;
  }

  registerAction(action: Action) {
    this.actions[action.name] = action;
  }

  registerAll(actions: readonly Action[]) {
    actions.forEach((action) => this.registerAction(action));
  }

  handleKeyDown(event: KeyboardEvent) {
    const canvas = this.canvas();
    if (canvas === null) {
      return false;
    }
    const data = Object.values(this.actions)
      .sort((a, b) => (b.keyPriority || 0) - (a.keyPriority || 0))
      .filter(
        (action) =>
          action.keyTest &&
          action.keyTest(
            event,
            this.getAppState(),
            this.getElementsIncludingDeleted(),
          ),
      );

    if (data.length === 0) {
      return false;
    }

    event.preventDefault();
    this.updater(
      data[0].perform(
        this.getElementsIncludingDeleted(),
        this.getAppState(),
        null,
        this.window,
        canvas,
      ),
    );
    return true;
  }

  executeAction(action: Action) {
    const canvas = this.canvas();
    if (canvas === null) {
      return;
    }
    this.updater(
      action.perform(
        this.getElementsIncludingDeleted(),
        this.getAppState(),
        null,
        this.window,
        canvas,
      ),
    );
  }

  getContextMenuItems(actionFilter: ActionFilterFn = (action) => action) {
    const canvas = this.canvas();
    if (canvas === null) {
      return [];
    }
    return Object.values(this.actions)
      .filter(actionFilter)
      .filter((action) => "contextItemLabel" in action)
      .sort(
        (a, b) =>
          (a.contextMenuOrder !== undefined ? a.contextMenuOrder : 999) -
          (b.contextMenuOrder !== undefined ? b.contextMenuOrder : 999),
      )
      .map((action) => ({
        label: action.contextItemLabel ? t(action.contextItemLabel) : "",
        action: () => {
          this.updater(
            action.perform(
              this.getElementsIncludingDeleted(),
              this.getAppState(),
              null,
              this.window,
              canvas,
            ),
          );
        },
      }));
  }

  renderAction = (name: ActionName) => {
    const canvas = this.canvas();
    if (canvas === null) {
      return null;
    }
    if (this.actions[name] && "PanelComponent" in this.actions[name]) {
      const action = this.actions[name];
      const PanelComponent = action.PanelComponent!;
      const updateData = (formState?: any) => {
        this.updater(
          action.perform(
            this.getElementsIncludingDeleted(),
            this.getAppState(),
            formState,
            this.window,
            canvas,
          ),
        );
      };

      return (
        <PanelComponent
          elements={this.getElementsIncludingDeleted()}
          appState={this.getAppState()}
          updateData={updateData}
          window={this.window}
        />
      );
    }

    return null;
  };
}
