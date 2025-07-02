import { debounce } from "lodash-es";
import { Camera, EventDispatcher, MathUtils, Mesh, Vector3, WebGLRenderer } from "three";
import { Tween } from "three/examples/jsm/libs/tween.module.js";

import { type ActionInstanceMap, type ActionName, Actions } from "../actions";
import type ShareScene from "../common/ShareScene";

interface TEventMap {
  renderBefore: EmptyObject;
  renderAfter: EmptyObject;
}

interface TweenOptions<T extends Vector3 = Vector3> {
  from: T;
  to: T;
  duration?: number;
  onUpdate?: (object: T, elapsed: number) => void;
  onComplete?: (object: T) => void;
}

export default abstract class Viewer extends EventDispatcher<TEventMap> {
  enabled = true;

  container: HTMLElement;

  shareScene: ShareScene;

  renderer: WebGLRenderer;

  autoFocus = true;

  focusObject?: Mesh;

  actionMap = new Map<ActionName, ActionInstanceMap[ActionName]>();

  get width() {
    return this.container.clientWidth || 10;
  }

  get height() {
    return this.container.clientHeight || 10;
  }

  get aspect() {
    return this.width / this.height;
  }

  abstract camera: Camera;

  readonly id: string;

  readonly name: string;

  private _resizeObserver: ResizeObserver;

  private _renderTimer = 0;

  private _tween: Tween<Vector3> | null = null;

  constructor(container: HTMLElement, shareScene: ShareScene, name = "") {
    super();
    this.id = MathUtils.generateUUID();
    this.name = name;

    this.container = container;
    this.shareScene = shareScene;
    shareScene.addView(this);

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.autoClear = false;
    this.renderer.sortObjects = false;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.container.appendChild(this.renderer.domElement);

    this._resizeObserver = new ResizeObserver(
      debounce(() => {
        this.resize();
      }, 100),
    );
    this._resizeObserver.observe(this.container);
  }

  resize() {
    this.renderer.setSize(this.width, this.height);
    this.render();
  }

  toggle(enabled?: boolean) {
    this.enabled = enabled === undefined ? !this.enabled : enabled;
    if (this.enabled) this.render();
  }

  render() {
    if (!this.enabled || this._renderTimer) return;
    this._renderTimer = requestAnimationFrame(() => {
      this.dispatchEvent({ type: "renderBefore" });
      this.renderer.clear();
      this.renderFrame();
      this.dispatchEvent({ type: "renderAfter" });
      this._renderTimer = 0;
    });
  }

  dispose() {
    this.enabled = false;
    // Cancel any pending render
    if (this._renderTimer) {
      cancelAnimationFrame(this._renderTimer);
      this._renderTimer = 0;
    }
    this.disposeEvent();
    this.shareScene.removeView(this);
    this.actionMap.forEach((action) => {
      action.dispose();
    });
    this.actionMap.clear();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this._resizeObserver.disconnect();
    this._tween?.stop();
    this._tween = null;
  }

  getAction<T extends ActionName>(name: T) {
    return this.actionMap.get(name) as ActionInstanceMap[T] | undefined;
  }

  setActions(...actionNames: ActionName[]) {
    actionNames.forEach((name) => {
      const ActionCtr = Actions.get(name);
      if (!ActionCtr) return;
      const action = new ActionCtr(this);
      action.init();
      this.actionMap.set(name, action);
    });
  }

  disableAction(...actionNames: ActionName[]) {
    if (actionNames.length) {
      actionNames.forEach((name) => {
        const action = this.actionMap.get(name);
        if (action) action.toggle(false);
      });
    } else {
      this.actionMap.forEach((action) => {
        action.toggle(false);
      });
    }
  }

  enableAction(...actionNames: ActionName[]) {
    if (actionNames.length) {
      actionNames.forEach((name) => {
        const action = this.actionMap.get(name);
        if (action) action.toggle(true);
      });
    } else {
      this.actionMap.forEach((action) => {
        action.toggle(true);
      });
    }
  }

  tween(options: TweenOptions) {
    const { from, to, duration = 200, onUpdate, onComplete } = options;
    if (this._tween) this._tween.stop();
    this._tween = new Tween(from)
      .to(to, duration)
      .onUpdate((object, elapsed) => {
        onUpdate?.(object, elapsed);
        this.render();
      })
      .onComplete((object) => {
        onComplete?.(object);
        this._tween?.stop();
        this._tween = null;
      })
      .start();

    this._tweenFrame();
  }

  private _tweenFrame = (time?: number) => {
    if (this._tween) {
      this._tween.update(time);
      requestAnimationFrame(this._tweenFrame);
    }
  };

  abstract initEvent(): void;

  abstract disposeEvent(): void;

  abstract focus(object?: Mesh): void;

  abstract renderFrame(): void;
}
