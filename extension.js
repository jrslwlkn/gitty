const cp = require("child_process");

/**
 * @param {string} cmd
 */
function exec(cmd, opts = {}) {
	return new Promise((res, rej) => cp.exec(cmd, opts, (err, out) => (err ? rej(err) : res(out))));
}

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const _cwd = () => vscode.workspace.rootPath;

/**
 * @param {string} str
 */
const _str2arr = (str) => {
	return str
		.split("\n")
		.filter((x) => x.trim())
		.map((x) => x.trim().split(" ")[0]);
};

/**
 * @param {string} cmd
 */
const _exec = async (cmd, opts = {}) => {
	const s = await exec(cmd, { ...opts, cwd: opts.cwd || _cwd() });
	return _str2arr(s);
};

const _wtrees = async () => await _exec("git worktree list");

const _branches = async () => {
	const s = await _exec("git branch -a");
	return s.map((x) => x.replace(/^remotes\//g, "").trim());
};

const _wt_cur_dir = async () => {
	const res = await _exec("git rev-parse --show-toplevel");
	return res[0];
};

const _wt_base_dir = async () => {
	const s = await _wt_cur_dir();
	return s.replace(/\/[^\/]+$/g, "").trim();
};

const _ui_alert = (s = "") => s && vscode.window.showInformationMessage(s);

const _ui_input = async (placeHolder = "") => {
	return vscode.window.showInputBox({ placeHolder });
};

/**
 * @param {string} placeHolder
 * @param {string[]} options
 */
const _ui_select = async (placeHolder, options) => {
	return vscode.window.showQuickPick(options, { placeHolder });
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const addWT = vscode.commands.registerCommand("gitty.add_worktree", async () => {
		const branches = _branches();
		let name = await _ui_input("Add worktree directory name (optional)");
		const custom = "Enter SHA";
		const selection = await _ui_select("Select base for new worktree", [
			custom,
			...(await branches),
		]);
		const base = (selection === custom ? await _ui_input() : selection).trim();

		if (!base) return;

		name = name ? name.trim() : "";
		await _exec("git worktree add " + name + " " + base);
		// _ui_alert("Created worktree for " + base);
		const base_dir = await _cwd();
		await _exec("code .", { cwd: base_dir + "/" + (name || base) });
	});

	const removeWT = vscode.commands.registerCommand("gitty.remove_worktree", async () => {
		const wtrees = await _wtrees();
		const selection = await _ui_select("Select worktree to remove", wtrees);

		if (!selection) return;

		await _exec("git worktree remove '" + selection + "'");
		_ui_alert("Removed worktree at " + selection);
	});

	const listWT = vscode.commands.registerCommand("gitty.list_worktrees", async () => {
		const wtrees = await _wtrees();
		const selection = await _ui_select("Select worktree to open", wtrees);

		if (!selection) return;

		await _exec("code .", { cwd: selection });
	});

	context.subscriptions.push(addWT, removeWT, listWT);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate,
};
