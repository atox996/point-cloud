export function uniform(target: object, propertyKey: string | symbol) {
  Object.defineProperty(target, propertyKey, {
    get() {
      return this.getUniform(propertyKey);
    },
    set(value) {
      if (value !== this.getUniform(propertyKey)) {
        this.setUniform(propertyKey, value);
      }
    },
  });
}
