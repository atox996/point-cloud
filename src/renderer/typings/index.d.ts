export {};

declare global {
  type PositiveAxis<T> = T extends `-${infer _}` ? _ : T;

  type EmptyObject = {};

  type UniformType = import("three").ShaderMaterialUniformJSON extends infer U
    ? U extends { type: string }
      ? U
      : never
    : never;
  type UniformValueMap = {
    [K in UniformType as K["type"]]: K["value"];
  };
}
