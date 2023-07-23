import {expect} from "chai";
import WatchFunctionDeploymentTask from "../../../services/function/watchFunctionDeploymentTask";
import FunctionService from "../../../services/function/functionService";
import {TPulsarAdmin} from "../../../types/tPulsarAdmin";
import {before} from "mocha";
import {BaseProvider} from "../../../pulsarAdminProviders/base-provider/provider";

describe("Watch function task tests", () => {
  let pulsarAdmin: TPulsarAdmin;
  let functionService: FunctionService;
  const providerTypeName = "test-provider";

  before(() => {
    //Todo: make sure pulsar is running

    pulsarAdmin = new BaseProvider(providerTypeName, "http://localhost:8080", undefined);
    functionService = new FunctionService(pulsarAdmin);
  });

  it("should execute the watch action",async () => {
    const w = new WatchFunctionDeploymentTask("a-tenant", "a-namespace", "a-function", functionService, null);
    const funcStatus = await w.action();
    expect(funcStatus).to.not.be.undefined;
  });

  it("should complete the task",() => {
    const functionStatus = {
      numInstances: 1,
      numRunning: 1,
      instances: []
    };

    const w = new WatchFunctionDeploymentTask("a-tenant", "a-namespace", "a-function", functionService, null);
    expect(w.complete(false, functionStatus)).to.be.true;
  });

  it("should not complete the task",() => {
    const functionStatus = {
      numInstances: 0,
      numRunning: 0,
      instances: []
    };

    const w = new WatchFunctionDeploymentTask("a-tenant", "a-namespace", "a-function", functionService, null);
   expect(w.complete(false, functionStatus)).to.be.false;
  });

  it("should report starting progress",() => {
    const functionStatus = {
      numInstances: 0,
      numRunning: 0,
      instances: []
    };

    const w = new WatchFunctionDeploymentTask("a-tenant", "a-namespace", "a-function", functionService, null);
    const prog = w.onProgress(functionStatus);
    expect(prog.message).to.equal("Function instances starting");
  });

  it("should report instance progress",() => {
    const functionStatus = {
      numInstances: 4,
      numRunning: 2,
      instances: []
    };

    const w = new WatchFunctionDeploymentTask("a-tenant", "a-namespace", "a-function", functionService, null);
    const progress = w.onProgress(functionStatus);
    expect(progress.message).to.include(`(2 of 4)`);
  });
});