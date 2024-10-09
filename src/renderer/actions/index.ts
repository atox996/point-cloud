import type Viewer from "../views/Viewer";
import Action from "./Action";
import { ActionName } from "./enum";
import CreateAction from "./CreateAction";
import OrbitControlsAction from "./OrbitControlsAction";

type ActionCtr = new (viewer: Viewer) => Action;

const Actions = new Map<ActionName, ActionCtr>([
  [ActionName.Create, CreateAction],
  [ActionName.OrbitControls, OrbitControlsAction],
]);

export { Action, ActionName, Actions };
export type { ActionCtr };
