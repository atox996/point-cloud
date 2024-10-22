import type Viewer from "../views/Viewer";
import Action from "./Action";
import CreateAction from "./CreateAction";
import OrbitControlsAction from "./OrbitControlsAction";

type ActionMap = {
  Create: new (viewer: Viewer) => CreateAction;
  OrbitControls: new (viewer: Viewer) => OrbitControlsAction;
};

type ActionInstanceMap = {
  [K in keyof ActionMap]: InstanceType<ActionMap[K]>;
};

type ActionName = keyof ActionMap;

const Actions = new Map<ActionName, ActionMap[ActionName]>([
  ["Create", CreateAction],
  ["OrbitControls", OrbitControlsAction],
]);

export { Action, Actions };
export type { ActionName, ActionInstanceMap };
