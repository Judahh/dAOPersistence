class ObjectUtils {
  static filter(object?, predicate?) {
    const result = {};
    if (object)
      for (const key in object) {
        if (
          Object.prototype.hasOwnProperty.call(object, key) &&
          predicate &&
          predicate(key, object[key])
        ) {
          result[key] = object[key];
        }
      }
    return result;
  }
}

export { ObjectUtils };
