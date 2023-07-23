import {before} from "mocha";
import {expect} from "chai";
import FunctionService from "../../../services/function/functionService";
import {TPulsarAdmin} from "../../../types/tPulsarAdmin";
import {BaseProvider} from "../../../pulsarAdminProviders/base-provider/provider";
import * as path from "path";
import * as yaml from 'yaml';
import {FunctionConfig} from "@apache-pulsar/pulsar-admin/dist/gen/models";

describe("Function service tests", () => {
  let pulsarAdmin: TPulsarAdmin;
  let functionService: FunctionService;
  const providerTypeName = "test-provider";

  before(() => {
    //Todo: make sure pulsar is running

    pulsarAdmin = new BaseProvider(providerTypeName, "http://localhost:8080", undefined);
    functionService = new FunctionService(pulsarAdmin);
  });

  it("should error because the function doesn't exist", async () => {
    await functionService.startFunction("tenant", "namespace", "function")
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });

    await functionService.restartFunction("tenant", "namespace", "function")
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });

    await functionService.stopFunction("tenant", "namespace", "function")
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });
  });

  it("should not error because the function doesn't exist", async () => {
    await functionService.deleteFunction("tenant", "namespace", "function")
      .then(() => {
        expect(true).to.be.true;
      });
  });

  it("should create function", async () => {
    const functionConfig = {
      tenant: "tenant",
      namespace: "namespace",
      name: "function",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      py: "test-py-func.py",
    };

    const functionFilePath = path.join(__dirname, "..", "..", "assets", "test-py-func.py");

    await functionService.createFunction(functionConfig, functionFilePath)
      .then(() => {
        expect(true).to.be.true;
      });
  });

  it("should get a valid yaml function template", async () => {
    const template: yaml.Document | {} = functionService.getFunctionTemplate("yaml",
      "a-provider",
      "a-cluster",
      "a-tenant",
      "a-namespace");

    expect(template).to.not.be.empty;
    expect(template).to.be.instanceof(yaml.Document);

    const templateYaml = template as yaml.Document;
    expect(templateYaml.get("tenant")).to.equal("a-tenant");
    expect(templateYaml.get("namespace")).to.equal("a-namespace");
  });

  it("should get a valid json function template", async () => {
    const template: {} = functionService.getFunctionTemplate("json",
      "a-provider",
      "a-cluster",
      "a-tenant",
      "a-namespace");

    expect(template).to.not.be.empty;
    expect(template).to.be.instanceof(Object);

    const functionConfig = template as FunctionConfig;
    expect(functionConfig.tenant).to.equal("a-tenant");
    expect(functionConfig.namespace).to.equal("a-namespace");
  });

  it("should find py function runtime path", async () => {
    const functionConfig = {
      tenant: "tenant",
      namespace: "namespace",
      name: "function",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      go: "",
      py: "asdf",
      jar: ""
    };

    expect(FunctionService.findFunctionRuntimeFilePath(functionConfig)).to.equal("asdf");
  });

  it("should find go function runtime path", async () => {
    const functionConfig = {
      tenant: "tenant",
      namespace: "namespace",
      name: "function",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      go: "asdf",
      py: "",
      jar: ""
    };

    expect(FunctionService.findFunctionRuntimeFilePath(functionConfig)).to.equal("asdf");
  });

  it("should find jar function runtime path", async () => {
    const functionConfig = {
      tenant: "tenant",
      namespace: "namespace",
      name: "function",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      go: "",
      py: "",
      jar: "asdf"
    };

    expect(FunctionService.findFunctionRuntimeFilePath(functionConfig)).to.equal("asdf");
  });

  it("should have undefined function runtime path", async () => {
    const functionConfig = {
      tenant: "tenant",
      namespace: "namespace",
      name: "function",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      go: "",
      py: "",
      jar: ""
    };

    expect(FunctionService.findFunctionRuntimeFilePath(functionConfig)).to.be.undefined;
  });

  it("should normalize function config", async () => {
    const functionConfig = {
      tenant: "null",
      namespace: "",
      name: 'null',
      className: "className",
      inputs: [ "asdf", "null", "" ],
      parallelism: 1,
      autoAck: true,
      go: "",
      py: "somenullvalue",
      jar: null
    };

    const normalizedFunctionConfig = FunctionService.normalizeFunctionConfigValues(functionConfig);

    expect(normalizedFunctionConfig.tenant).to.be.empty;
    expect(normalizedFunctionConfig.namespace).to.be.empty;
    expect(normalizedFunctionConfig.name).to.be.empty;
    expect(normalizedFunctionConfig.className).to.equal('className');
    expect(normalizedFunctionConfig.inputs).to.deep.equal([ 'asdf' ]);
    expect(normalizedFunctionConfig.jar).to.be.null;
    expect(normalizedFunctionConfig.parallelism).to.equal(1);
    expect(normalizedFunctionConfig.autoAck).to.be.true;
    expect(normalizedFunctionConfig.py).to.equal('somenullvalue');
  });
});