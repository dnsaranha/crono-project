
// Object.groupBy polyfill
if (!Object.groupBy) {
  Object.defineProperty(Object, 'groupBy', {
    value: function<T>(items: T[], keyFn: (item: T) => string | number) {
      return items.reduce((result, item) => {
        const key = keyFn(item);
        if (!result[key]) {
          result[key] = [];
        }
        result[key].push(item);
        return result;
      }, {} as Record<string | number, T[]>);
    }
  });
}

export {};
