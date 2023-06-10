import { TPulsarAdmin } from "../../types/tPulsarAdmin";
import {BaseProvider} from "../base-provider/provider";

export class Provider extends BaseProvider implements TPulsarAdmin{
  constructor(webServiceUrl: string, pulsarToken: string) {
    if (webServiceUrl === null || webServiceUrl === undefined) {
      throw new Error("Web service url is required");
    }

    if (pulsarToken === null || pulsarToken === undefined) {
      throw new Error("Pulsar token is required");
    }

    super("datastax-astra-streaming", webServiceUrl, pulsarToken);
  }
}