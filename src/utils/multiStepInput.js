"use strict";
// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiStepInput = void 0;
const vscode_1 = require("vscode");
class InputFlowAction {
}
InputFlowAction.back = new InputFlowAction();
InputFlowAction.cancel = new InputFlowAction();
InputFlowAction.resume = new InputFlowAction();
class MultiStepInput {
    constructor() {
        this.steps = [];
    }
    // @ts-ignore
    static async run(start) {
        const input = new MultiStepInput();
        return input.stepThrough(start);
    }
    // @ts-ignore
    async stepThrough(start) {
        let step = start;
        while (step) {
            this.steps.push(step);
            if (this.current) {
                this.current.enabled = false;
                this.current.busy = true;
            }
            try {
                step = await step(this);
            }
            catch (err) {
                if (err === InputFlowAction.back) {
                    this.steps.pop();
                    step = this.steps.pop();
                }
                else if (err === InputFlowAction.resume) {
                    step = this.steps.pop();
                }
                else if (err === InputFlowAction.cancel) {
                    step = undefined;
                }
                else {
                    throw err;
                }
            }
        }
        if (this.current) {
            this.current.dispose();
        }
    }
    async showQuickPick({ title, step, totalSteps, items, activeItem, ignoreFocusOut, placeholder, buttons, shouldResume }) {
        const disposables = [];
        try {
            return await new Promise((resolve, reject) => {
                const input = vscode_1.window.createQuickPick();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.ignoreFocusOut = ignoreFocusOut || false;
                input.placeholder = placeholder;
                input.items = items;
                if (activeItem) {
                    input.activeItems = [activeItem];
                }
                input.buttons = [
                    ...(this.steps.length > 1 ? [vscode_1.QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                disposables.push(input.onDidTriggerButton(item => {
                    if (item === vscode_1.QuickInputButtons.Back) {
                        reject(InputFlowAction.back);
                    }
                    else {
                        resolve(item);
                    }
                }), input.onDidChangeSelection(items => resolve(items[0])), input.onDidHide(() => {
                    (async () => {
                        reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                    })()
                        .catch(reject);
                }));
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    }
    async showInputBox({ title, step, totalSteps, value, prompt, validate, buttons, ignoreFocusOut, placeholder, shouldResume }) {
        const disposables = [];
        try {
            return await new Promise((resolve, reject) => {
                const input = vscode_1.window.createInputBox();
                input.title = title;
                input.step = step;
                input.totalSteps = totalSteps;
                input.value = value || '';
                input.prompt = prompt;
                input.ignoreFocusOut = ignoreFocusOut || false;
                input.placeholder = placeholder;
                input.buttons = [
                    ...(this.steps.length > 1 ? [vscode_1.QuickInputButtons.Back] : []),
                    ...(buttons || [])
                ];
                let validating = validate('');
                disposables.push(input.onDidTriggerButton(item => {
                    if (item === vscode_1.QuickInputButtons.Back) {
                        reject(InputFlowAction.back);
                    }
                    else {
                        resolve(item);
                    }
                }), input.onDidAccept(async () => {
                    const value = input.value;
                    input.enabled = false;
                    input.busy = true;
                    if (!(await validate(value))) {
                        resolve(value);
                    }
                    input.enabled = true;
                    input.busy = false;
                }), input.onDidChangeValue(async (text) => {
                    const current = validate(text);
                    validating = current;
                    const validationMessage = await current;
                    if (current === validating) {
                        input.validationMessage = validationMessage;
                    }
                }), input.onDidHide(() => {
                    (async () => {
                        reject(shouldResume && await shouldResume() ? InputFlowAction.resume : InputFlowAction.cancel);
                    })()
                        .catch(reject);
                }));
                if (this.current) {
                    this.current.dispose();
                }
                this.current = input;
                this.current.show();
            });
        }
        finally {
            disposables.forEach(d => d.dispose());
        }
    }
}
exports.MultiStepInput = MultiStepInput;
//# sourceMappingURL=multiStepInput.js.map