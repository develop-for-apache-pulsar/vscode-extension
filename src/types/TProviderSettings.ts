import {WebView} from "../utils/webView";

export type TProviderSettings = {
  typeName: string;
  displayName: string;
  description: string;
  darkIconFileName: string;
  lightIconFileName: string;
  saveProviderWizard: {
    new(wizard: WebView): {
      startWizard(): string;
      receivedMessage(message: any): Promise<void>;
    };
  }
};