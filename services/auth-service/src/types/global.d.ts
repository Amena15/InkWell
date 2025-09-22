// Type definitions for global test variables
declare namespace NodeJS {
  interface Global {
    describe: typeof describe;
    it: typeof it;
    beforeAll: typeof beforeAll;
    afterAll: typeof afterAll;
    beforeEach: typeof beforeEach;
    afterEach: typeof afterEach;
    expect: typeof expect;
    test: typeof test;
    jest: typeof jest;
  }
}

declare const describe: typeof global.describe;
declare const it: typeof global.it;
declare const beforeAll: typeof global.beforeAll;
declare const afterAll: typeof global.afterAll;
declare const beforeEach: typeof global.beforeEach;
declare const afterEach: typeof global.afterEach;
declare const expect: typeof global.expect;
declare const test: typeof global.test;
declare const jest: typeof global.jest;
