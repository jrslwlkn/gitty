const cp = require("child_process");

function exec(cmd, opts = {}) {
	return new Promise((res, rej) => cp.exec(cmd, opts, (err, out) => (err ? rej(err) : res(out))));
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const _cwd = () => vscode.workspace.workspaceFolders[0].uri.fsPath;

const _str2arr = (str) => {
	return str
		.split("\n")
		.filter((x) => x.trim())
		.map((x) => x.trim().split(" ")[0]);
};

const _exec = async (cmd, opts = {}) => {
	const s = await exec(cmd, { ...opts, cwd: opts.cwd || _cwd() });
	return _str2arr(s);
};

const _wtrees = async () => await _exec("git worktree list");

const _branches = async () => await _exec("git branch -a");

const _wt_cur_dir = async () => {
	const res = await _exec("git rev-parse --show-toplevel");
	return res[0];
};

const _wt_base_dir = async () => {
	const s = await _wt_cur_dir();
	return s.replace(/\/[^\/]+$/g, "").trim();
};

const _ui_alert = (s) => vscode.window.showInformationMessage(s);

const _ui_input = async (placeHolder) => {
	return vscode.window.showInputBox({ placeHolder });
};

const _ui_select = async (placeHolder, options) => {
	return vscode.window.showQuickPick(options, { placeHolder });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "Gitty" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand("gitty.helloWorld", function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage("Hello World from gitty!");
	});

	const addWT = vscode.commands.registerCommand("gitty.add_worktree", async () => {
		const branches = _branches();

	});

	context.subscriptions.push(disposable, addWT);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
