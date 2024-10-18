import type Viewer from "../views/Viewer";
import Action from "./Action";
import { ActionName } from "./enum";
import CreateAction from "./CreateAction";
import OrbitControlsAction from "./OrbitControlsAction";

type ActionMap = {
  [ActionName.Create]: new (viewer: Viewer) => CreateAction;
  [ActionName.OrbitControls]: new (viewer: Viewer) => OrbitControlsAction;
};

type ActionInstanceMap = {
  [K in keyof ActionMap]: InstanceType<ActionMap[K]>;
};

type ActionConstructor<T extends ActionName> = ActionMap[T];

const Actions = new Map<ActionName, ActionConstructor<ActionName>>([
  [ActionName.Create, CreateAction],
  [ActionName.OrbitControls, OrbitControlsAction],
]);

export { Action, ActionName, Actions };
export type { ActionConstructor, ActionInstanceMap };
