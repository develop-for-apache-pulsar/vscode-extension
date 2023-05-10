import {BaseProvider} from "../base-provider/provider";

export class Provider extends BaseProvider{
  constructor(webServiceUrl: string, pulsarToken?: string) {
    if (webServiceUrl === null || webServiceUrl === undefined) {
      throw new Error("Web service url is required");
    }

    super(webServiceUrl, pulsarToken);
  }
}