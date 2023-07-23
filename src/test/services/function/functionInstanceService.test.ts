import {before} from "mocha";
import {expect} from "chai";
import FunctionInstanceService from "../../../services/function/functionInstanceService";
import {TPulsarAdmin} from "../../../types/tPulsarAdmin";
import {BaseProvider} from "../../../pulsarAdminProviders/base-provider/provider";

describe("Function instance service tests", () => {
  let pulsarAdmin: TPulsarAdmin;
  let functionInstanceService: FunctionInstanceService;
  const providerTypeName = "test-provider";

  before(() => {
    //Todo: make sure pulsar is running

    pulsarAdmin = new BaseProvider(providerTypeName, "http://localhost:8080", undefined);
    functionInstanceService = new FunctionInstanceService(pulsarAdmin);
  });

  it("should error because the function instance doesn't exist", async () => {
    await functionInstanceService.startFunctionInstance("tenant", "namespace", "function", 1)
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });

    await functionInstanceService.restartFunctionInstance("tenant", "namespace", "function", 1)
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });

    await functionInstanceService.stopFunctionInstance("tenant", "namespace", "function", 1)
      .catch((e: any) => {
        expect(e).to.be.an("error");
        expect(e.message).to.not.be.empty;
      });
  });
});