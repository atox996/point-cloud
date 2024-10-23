import type { Box3, Camera, Vector3 } from "three";
import type { Box3D } from "../objects";

/**
 * Defines a camera interface with additional functionalities such as resizing,
 * focusing on a target, and calculating bounding boxes.
 *
 * @extends {Camera} Inherits basic camera properties and methods from the Three.js Camera class.
 */
export interface CameraImplements extends Camera {
  /**
   * A read-only property representing the camera's current target in world space.
   * Used as the point the camera is looking at.
   *
   * @readonly
   * @type {Vector3}
   */
  readonly lookTarget: Vector3;

  /**
   * Resizes the camera's aspect ratio based on the given width and height,
   * and updates its projection matrix.
   *
   * @param {number} width - The width to set for the camera's aspect ratio.
   * @param {number} height - The height to set for the camera's aspect ratio.
   * @returns {void}
   */
  resize(width: number, height: number): void;

  /**
   * Adjusts the camera's position to focus on the given 3D object.
   * The camera is positioned at a fixed distance from the center of the target's bounding box
   * and then rotated to look at the target.
   *
   * @template T
   * @param {T} target - The 3D object on which to focus the camera.
   * @returns {void}
   */
  focusTarget<T extends Box3D>(target: T): void;

  /**
   * Computes and returns the world-space bounding box of the given 3D object.
   * The bounding box is calculated by applying the object's transformation matrix
   * to its local bounding box.
   *
   * @template T
   * @param {T} target - The 3D object whose bounding box is to be calculated.
   * @returns {Box3} The world-space bounding box of the target.
   */
  getBoundingBox<T extends Box3D>(target: T): Box3;
}
