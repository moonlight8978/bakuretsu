import pLimit from "p-limit";
import os from "os";

Promise.sequence = async function <T, U>(
  iterable: Array<T>,
  fn: (value: T, index: number) => Promise<U>,
  concurrency = 1
) {
  const sequentially = pLimit(concurrency);
  return await Promise.all(
    iterable.map((e, index) => sequentially(async () => await fn(e, index)))
  );
};

Promise.parallel = async function <T, U>(
  iterable: Array<T>,
  fn: (value: T, index: number) => Promise<U>
) {
  return Promise.sequence(iterable, fn, os.cpus().length);
};

declare global {
  interface PromiseConstructor {
    sequence: <T, U>(
      iterable: Array<T>,
      fn: (value: T, index: number) => Promise<U>,
      concurrency?: number
    ) => Promise<U[]>;

    parallel: <T, U>(
      iterable: Array<T>,
      fn: (value: T, index: number) => Promise<U>
    ) => Promise<U[]>;
  }
}
