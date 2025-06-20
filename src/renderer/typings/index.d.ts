export {};

declare global {
  type PositiveAxis<T> = T extends `-${infer _}` ? _ : T;
  type EmptyObject = {};
}
