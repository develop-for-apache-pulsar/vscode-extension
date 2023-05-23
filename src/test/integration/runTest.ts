import {downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests} from '@vscode/test-electron';
import * as path from "path"; //1.78.2

async function go() {
	const extensionDevelopmentPath = path.resolve(__dirname, '../../');
	const extensionTestsPath = path.resolve(__dirname, './suite');

	/**
	 * Basic usage
	 */
	await runTests({
		extensionDevelopmentPath,
		extensionTestsPath,
	});

	// try {
	 //	const vscodeExecutablePath = await downloadAndUnzipVSCode('1.78.2');
	//
	// 	const cliArgs = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);
	// 	const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
	// 	const extensionTestsPath = path.resolve(__dirname, './suite/index');
	// 	const testWorkspace = path.resolve(__dirname, '../../../testFixture');
	// 	const launchArgs = [testWorkspace, '--disable-extensions', '--disable-gpu', '--headless', '--no-sandbox', '--remote-debugging-port=9222'];
	// 	const result = await runTests({ vscodeExecutablePath, extensionDevelopmentPath, extensionTestsPath, launchArgs });
	// 	if (result.failed) {
	// 		console.error(result);
	// 		process.exit(1);
	// 	}
	// } catch (err) {
	// 	console.error('Failed to run tests');
	// 	process.exit(1);
	// }
}

go();