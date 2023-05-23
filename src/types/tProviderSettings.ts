import {Wizard} from "../utils/wizard";

export type TProviderSettings = {
  typeName: string;
  displayName: string;
  description: string;
  darkIconFileName: string;
  lightIconFileName: string;
  saveProviderWizard: {
    new(wizard: Wizard): {
      startWizard(): string;
      receivedMessage(message: any): Promise<void>;
    };
  }
};