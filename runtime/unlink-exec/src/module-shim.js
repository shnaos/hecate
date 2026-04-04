import * as blake2b from "../../../node_modules/@zk-kit/eddsa-poseidon/dist/lib.esm/eddsa-poseidon-blake-2b.js";

export function createRequire() {
  return function browserRequire(specifier) {
    if (specifier === "@zk-kit/eddsa-poseidon/blake-2b") {
      return blake2b;
    }

    throw new Error(`Unsupported require in Unlink browser shim: ${specifier}`);
  };
}
