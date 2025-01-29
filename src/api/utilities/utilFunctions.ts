export const randomNumberRange = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const catchError = async <T>(
  fn: Promise<T>
): Promise<[undefined, T] | [Error]> => {
  return fn
    .then((data) => {
      return [undefined, data] as [undefined, T];
    })
    .catch((error) => {
      return [error];
    });
};
