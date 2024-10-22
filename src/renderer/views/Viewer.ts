import { Camera, EventDispatcher, WebGLRenderer } from "three";
import type ShareScene from "../ShareScene";
import { Actions, type ActionInstanceMap, type ActionName } from "../actions";

export default abstract class Viewer extends EventDispatcher {
  abstract camera: Camera;

  container: HTMLElement;
  renderer: WebGLRenderer;
  shareScene: ShareScene;
  actions: ActionName[] = [];
  actionMap = new Map<ActionName, ActionInstanceMap[ActionName]>();

  get width() {
    return this.container.clientWidth;
  }
  get height() {
    return this.container.clientHeight;
  }

  resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, shareScene: ShareScene) {
    super();

    this.container = container;
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.domElement.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    this.container.appendChild(this.renderer.domElement);

    this.shareScene = shareScene;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  resize() {
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.render();
  }

  getAction<T extends ActionName>(name: T) {
    return this.actionMap.get(name) as ActionInstanceMap[T] | undefined;
  }

  setActions(actionNames: ActionName[]) {
    this.actions = actionNames;
    actionNames.forEach((name) => {
      const ActionCtr = Actions.get(name);
      if (!ActionCtr) return;
      const action = new ActionCtr(this);
      action.init();
      this.actionMap.set(name, action);
    });
  }

  disableAction(actionName?: ActionName | ActionName[]) {
    let names: ActionName[] = [];
    if (!actionName) {
      names = this.actions;
    } else {
      names = Array.isArray(actionName) ? actionName : [actionName];
      names.forEach((name) => {
        const action = this.actionMap.get(name);
        if (action) action.toggle(false);
      });
    }
  }

  enableAction(actionName?: ActionName | ActionName[]) {
    let names: ActionName[] = [];
    if (!actionName) {
      names = this.actions;
    } else {
      names = Array.isArray(actionName) ? actionName : [actionName];
    }

    names.forEach((name) => {
      const action = this.actionMap.get(name);
      if (action) action.toggle(true);
    });
  }

  render() {
    this.renderer.render(this.shareScene.scene, this.camera);
  }

  dispose() {
    this.renderer.dispose();
    this.resizeObserver.disconnect();

    this.actionMap.forEach((action) => {
      action.destroy();
    });
    this.actionMap.clear();
  }
}
