import {assert} from "chai";
import ConfigurationProvider from "../../providers/configurationProvider/configuration";
import * as vscode from "vscode";
const sinon = require("sinon");

describe("Calculator Tests", () => {
  let mockContext;

  beforeEach(() => {
    sinon.mock(vscode.workspace).expects("getConfiguration").returns({
      inspect: () => {
        return {
          globalValue: {
            "cluster": {
              "cluster1": {
                "host": "localhost",
                "port": 8080
              },
              "cluster2": {
                "host": "localhost",
                "port": 8080
              }
            }
          }
        };
      },
      update: () => {
        return;
      }
    });
  });

  afterEach(() => {
    mockContext = {
      subscriptions: []
    };
  });

  it("should return 5 when 2 is added to 3", () => {
    ConfigurationProvider.getClusterConfigs();
  });
});