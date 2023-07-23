import {FunctionConfig} from "@apache-pulsar/pulsar-admin/dist/gen/models";
import FunctionService from "../../../services/function/functionService";
import {expect} from "chai";

describe("Function config validations", () => {
  let functionConfig: FunctionConfig;

  beforeEach(() => {
    functionConfig = {
      tenant: "tenant",
      namespace: "tenant",
      name: "name",
      className: "className",
      inputs: [ "asdf" ],
      parallelism: 1,
      autoAck: true,
      go: "asdf",
      py: "asdf",
      jar: "asdf"
    };
  });

  it("should require tenant",() => {
    try{
      functionConfig.tenant = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'tenant' is required");
    }
  });

  it("should require namespace",() => {
    try{
      functionConfig.namespace = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'namespace' is required");
    }
  });

  it("should require name",() => {
    try{
      functionConfig.name = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'name' is required");
    }
  });

  it("should require parallelism",() => {
    try{
      functionConfig.parallelism = 0;
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'parallelism' is required and should be greater than zero");
    }
  });

  it("should require a runtime path",() => {
    try{
      functionConfig.py = "";
      functionConfig.go = "";
      functionConfig.jar = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("provide either 'py', 'jar', or 'go'");
    }
  });

  it("should require classname for py",() => {
    try{
      functionConfig.className = "";
      functionConfig.go = "";
      functionConfig.jar = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'className' is required");
    }
  });

  it("should require classname for jar",() => {
    try{
      functionConfig.className = "";
      functionConfig.go = "";
      functionConfig.py = "";
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'className' is required");
    }
  });

  it("should require inputs",() => {
    try{
      functionConfig.inputs = [];
      FunctionService.validateFunctionConfig(functionConfig);
    }catch (e:any) {
      expect(e.message).to.equal("'inputs' needs at least 1 topic");
    }
  });
});