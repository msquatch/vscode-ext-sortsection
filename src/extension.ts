// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as sorting from './sorting';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "sortsection" is now active!');

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_section',
			sorting.sort_section)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_selection',
			sorting.sort_selection)
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_section_desc',
			sorting.sort_section_desc
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_selection_desc',
			sorting.sort_selection_desc
		)
	);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_section_numeric',
			sorting.sort_section_numeric
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_selection_numeric',
			sorting.sort_selection_numeric
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_section_numeric_desc',
			sorting.sort_section_numeric_desc
		)
	);
	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand(
			'sortsection.sort_selection_numeric_desc',
			sorting.sort_selection_numeric_desc
		)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
