import os from "os";

import { assert } from "chai";
import fsExtra from "fs-extra";
import path from "path";
import shell from "shelljs";

import { useFixture } from "./helpers";

const hardhatBinary = path.join("node_modules", ".bin", "hardhat");

const versionRegExp = /^\d+\.\d+\.\d+\n$/;

describe("e2e tests", function () {
  before(function () {
    shell.set("-e"); // Ensure that shell failures will induce test failures
  });

  describe("basic-project", function () {
    useFixture("basic-project");

    it("should print the hardhat version", function () {
      const { code, stdout } = shell.exec(`${hardhatBinary} --version`);
      assert.equal(code, 0);
      assert.match(stdout, versionRegExp);
    });

    it("should compile", function () {
      // hh clean
      const { code: hhCleanCode1 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode1, 0);

      // hh compile
      const { code: hhCompileCode, stdout } = shell.exec(
        `${hardhatBinary} compile`
      );
      assert.equal(hhCompileCode, 0);

      // check artifacts were created
      const artifactsDir = path.join(this.testDirPath, "artifacts");
      assert.isTrue(fsExtra.existsSync(artifactsDir));

      // check stdout
      assert.match(stdout, /Compiled \d+ Solidity files? successfully/);

      // hh clean
      const { code: hhCleanCode2 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode2, 0);
    });

    it("should test programmatically", function () {
      // hh clean
      const { code: hhCleanCode1 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode1, 0);

      // hh compile
      const { code: testRunCode, stdout } = shell.exec(
        `${hardhatBinary} run ./scripts/multi-run-test.js`
      );
      assert.equal(testRunCode, 0);

      // check stdout

      // check we get passing runs
      assert.match(stdout, /2 passing/);
      // check we get no runs without tests
      assert.notMatch(
        stdout,
        /0 passing/,
        "A test run occured with 0 tests - potential caching issue"
      );

      // hh clean
      const { code: hhCleanCode2 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode2, 0);
    });

    it("the test task should accept test files", async function () {
      // hh clean
      const { code: hhCleanCode1 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode1, 0);

      // hh test without ./
      const { code: testRunCode1 } = shell.exec(
        `${hardhatBinary} test test/simple.js`
      );
      assert.equal(testRunCode1, 0);

      // hh test with ./
      const { code: testRunCode2 } = shell.exec(
        `${hardhatBinary} test ./test/simple.js`
      );
      assert.equal(testRunCode2, 0);
    });

    it("should run tests in parallel", function () {
      // hh clean
      const { code: hhCleanCode1 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode1, 0);

      // hh test --parallel
      const { code: hhCompileCode, stdout } = shell.exec(
        `${hardhatBinary} test --parallel`
      );
      assert.equal(hhCompileCode, 0);

      // check we get passing runs
      assert.match(stdout, /2 passing/);

      // hh clean
      const { code: hhCleanCode2 } = shell.exec(`${hardhatBinary} clean`);
      assert.equal(hhCleanCode2, 0);
    });
  });

  describe("sample projects", function () {
    // These tests generate the sample project and then exercise the commands
    // that are suggested to the user after project generation.  It would be
    // better if that list of commands were exernalized somewhere, in a place
    // from which we could consume them here, so that the lists of commands
    // executed here cannot fall out of sync with what's actually suggested to
    // the user, but this approach was more expedient.

    before(function () {
      if (os.type() === "Windows_NT") {
        // See https://github.com/nomiclabs/hardhat/issues/1698
        this.skip();
      }
    });

    describe("basic sample project", function () {
      useFixture("basic-sample-project");

      before(function () {
        shell.exec(`${hardhatBinary}`, {
          env: {
            ...process.env,
            HARDHAT_CREATE_BASIC_SAMPLE_PROJECT_WITH_DEFAULTS: "true",
          },
        });
      });

      for (const suggestedCommand of [
        // This list should be kept reasonably in sync with
        // hardhat-core/sample-projects/basic/README.txt
        `${hardhatBinary} accounts`,
        `${hardhatBinary} compile`,
        `${hardhatBinary} test`,
        "node scripts/sample-script.js",
      ]) {
        it(`should permit successful execution of the suggested command "${suggestedCommand}"`, async function () {
          shell.exec(suggestedCommand);
        });
      }
    });

    describe("advanced sample project", function () {
      useFixture("advanced-sample-project");

      before(function () {
        shell.exec(`${hardhatBinary}`, {
          env: {
            ...process.env,
            HARDHAT_CREATE_ADVANCED_SAMPLE_PROJECT_WITH_DEFAULTS: "true",
          },
        });
      });

      for (const suggestedCommand of [
        // This list should be kept reasonably in sync with
        // hardhat-core/sample-projects/advanced/README.txt
        `${hardhatBinary} compile`,
        `${hardhatBinary} test`,
        `${hardhatBinary} run scripts/deploy.js`,
        "node scripts/deploy.js",
        "REPORT_GAS=true npx hardhat test",
        `${hardhatBinary} coverage`,
        "npx eslint '**/*.js'",
        "npx eslint '**/*.js' --fix",
        "npx prettier '**/*.{json,sol,md}' --check",
        "npx solhint 'contracts/**/*.sol'",
        "npx solhint 'contracts/**/*.sol' --fix",
      ]) {
        it(`should permit successful execution of the suggested command "${suggestedCommand}"`, async function () {
          shell.exec(suggestedCommand);
        });
      }
    });

    describe("advanced TypeScript sample project", function () {
      useFixture("advanced-ts-sample-project");

      before(function () {
        shell.exec(`${hardhatBinary}`, {
          env: {
            ...process.env,
            HARDHAT_CREATE_ADVANCED_TYPESCRIPT_SAMPLE_PROJECT_WITH_DEFAULTS:
              "true",
          },
        });
      });

      for (const suggestedCommand of [
        // This list should be kept reasonably in sync with
        // hardhat-core/sample-projects/advanced-ts/README.txt
        `${hardhatBinary} compile`,
        `${hardhatBinary} test`,
        `${hardhatBinary} run scripts/deploy.ts`,
        "TS_NODE_FILES=true ts-node scripts/deploy.ts",
        "REPORT_GAS=true npx hardhat test",
        `${hardhatBinary} coverage`,
        "npx eslint '**/*.{ts,js}'",
        "npx eslint '**/*.{ts,js}' --fix",
        "npx prettier '**/*.{json,sol,md}' --check",
        "npx solhint 'contracts/**/*.sol'",
        "npx solhint 'contracts/**/*.sol' --fix",
      ]) {
        it(`should permit successful execution of the suggested command "${suggestedCommand}"`, async function () {
          shell.exec(suggestedCommand);
        });
      }
    });
  });

  describe("no project", function () {
    useFixture("empty");

    it("should print the hardhat version", function () {
      const { code, stdout } = shell.exec(`${hardhatBinary} --version`);
      assert.equal(code, 0);
      assert.match(stdout, versionRegExp);
    });

    it(`should print an error message if you try to compile`, function () {
      shell.set("+e");
      const { code, stderr } = shell.exec(`${hardhatBinary} compile`);
      shell.set("-e");
      assert.equal(code, 1);
      // This is a loose match to check HH1 and HH15
      assert.match(stderr, /You are not inside/);
      assert.match(stderr, /HH15?/);
    });
  });
});
