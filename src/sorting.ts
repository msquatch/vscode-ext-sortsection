import * as vscode from 'vscode';
import * as numcomp from './numeric_compare';

function get_eol(doc: vscode.TextDocument): string {
	if (doc.eol === vscode.EndOfLine.LF) {
		return "\n";
	} else if (doc.eol === vscode.EndOfLine.CRLF) {
		return "\r\n";
	}

	return "\n";
}

interface Section {
	start_line: number;
	end_line: number;
}

function find_and_sort_sections(
	start_line: number,
	end_line: number,
	descending?: boolean,
	numeric?: boolean
): void {
	let editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}
	let doc = editor.document;

	let sections: SectionRange[] = find_sections(start_line, end_line);
	let sorted_texts: string[] = [];

	let end_text_line: vscode.TextLine = doc.lineAt(end_line);
	let end_line_range_no_eol = end_text_line.range;
	let end_line_range_with_eol = end_text_line.rangeIncludingLineBreak;

	let full_start_pos = doc.lineAt(start_line).range.start.with(
			{ "character": 0 });
	let full_end_pos = end_line_range_no_eol.end;

	let eol: string = get_eol(doc);
	for (let section of sections) {
		let start_pos = doc.lineAt(section["start_line"]).range.start.with(
			{ "character": 0 }
		);
		let end_pos = doc.lineAt(section["end_line"]).range.end;
		let text: string = doc.getText(new vscode.Range(start_pos, end_pos));

		if (section["is_blank"]) {
			sorted_texts.push(text);
			continue;
		}

		if (text.endsWith(eol)) {
			text = text.substring(0, text.length - 1);
		}
		let lines: string[] = text.split(eol);
		if (numeric) {
			lines = numcomp.sort_numerically(lines);
		} else {
			lines.sort();
		}
		if (descending) {
			lines.reverse();
		}
		sorted_texts.push(lines.join(eol));
	}

	let range_to_replace = new vscode.Range(full_start_pos, full_end_pos);
	let new_text = sorted_texts.join(eol);

	let thenable = editor.edit((edit_builder: vscode.TextEditorEdit) => {
		edit_builder.replace(range_to_replace, new_text);
	});

	thenable.then((res) => {
		if (!res) {
			vscode.window.showErrorMessage("Failed to replace text!");
		}
	});
}

interface SectionRange {
	start_line: number;
	end_line: number;
	lines: string[];
	is_blank: boolean;
} 

function find_sections(
	start_line: number,
	end_line: number
): SectionRange[] {
	let sections: SectionRange[] = [];

	let last_was_ws: boolean = true;
	let sl: number = start_line;
	let el: number = start_line;

	let editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return sections;
	}
	let doc = editor.document;

	for (let i = start_line; i <= end_line; el = i, i++) {
		let line = doc.lineAt(i);
		if (i === start_line) {
			// First iteration.
			if (line.isEmptyOrWhitespace) {
				last_was_ws = true;
				continue;
			}
			last_was_ws = false;
			continue;
		}

		if (line.isEmptyOrWhitespace) {
			if (last_was_ws) {
				continue;
			}
			sections.push({"start_line": sl, "end_line": el, "lines": [],
				"is_blank": false});
			sl = i;
			last_was_ws = true;
			continue;
		}
		if (last_was_ws) {
			sections.push({"start_line": sl, "end_line": el, "lines": [],
				"is_blank": true});
			sl = i;
			last_was_ws = false;
			continue;
		}
	}

	if (last_was_ws) {
		sections.push({"start_line": sl, "end_line": el, "lines": [],
			"is_blank": true});
	} else {
		sections.push({"start_line": sl, "end_line": el, "lines": [],
			"is_blank": false});
	}

	return sections;
}

function _sort_selection(descending: boolean, numeric: boolean) {
	let editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}

	let selections = editor.selections;
	if (selections.length === 0) {
		vscode.window.showInformationMessage('No selection to sort!');
		return;
	}

	let sel = selections[0];
	if (sel.isEmpty) {
		vscode.window.showInformationMessage('Empty selection!');
	}
	// let cursor_pos = sel.active;

	let start_line = sel.start.line;
	let end_line = sel.end.line;

	find_and_sort_sections(start_line, end_line, descending, numeric);
}

function _sort_section(descending: boolean, numeric: boolean) {
	let editor = vscode.window.activeTextEditor;
	if (editor === undefined) {
		return;
	}

	let selections = editor.selections;
	if (selections.length === 0) {
		vscode.window.showErrorMessage('No cursor to work with!');
		return;
	}

	let sel = selections[0];
	let cursor_pos = sel.active;
	let doc = editor.document;

	let search_start_line = cursor_pos.line;
	let line = doc.lineAt(search_start_line);
	if (line.isEmptyOrWhitespace) {
		vscode.window.showErrorMessage("place cursor in a section of text");
		return;
	}

	let start_line = search_start_line;
	for (let i = start_line - 1; i >= 0; start_line = i, i--) {
		line = doc.lineAt(i);
		if (line.isEmptyOrWhitespace) {
			break;
		}
	}

	let end_line = search_start_line;
	for (let i = start_line + 1; i < doc.lineCount; end_line = i, i++) {
		line = doc.lineAt(i);
		if (line.isEmptyOrWhitespace) {
			break;
		}
	}

	find_and_sort_sections(start_line, end_line, descending, numeric);
}

// function _sort_selection(descending: boolean, numeric: boolean) {
// 	let editor = vscode.window.activeTextEditor;
// 	if (editor === undefined) {
// 		return;
// 	}

// 	let selections = editor.selections;
// 	if (selections.length === 0) {
// 		vscode.window.showInformationMessage('No selection to sort!');
// 		return;
// 	}

// 	let sel = selections[0];
// 	if (sel.isEmpty) {
// 		vscode.window.showInformationMessage('Empty selection!');
// 	}
// 	// let cursor_pos = sel.active;

// 	let start_line = sel.start.line;
// 	let end_line = sel.end.line;

// 	find_and_sort_sections(start_line, end_line, descending, numeric);
// }

export function sort_section() {
	_sort_section(false, false);
}

export function sort_section_desc() {
	_sort_section(true, false);
}

export function sort_section_numeric() {
	_sort_section(false, true);
}

export function sort_section_numeric_desc() {
	_sort_section(true, true);
}

export function sort_selection() {
	_sort_selection(false, false);
}

export function sort_selection_desc() {
	_sort_selection(true, false);
}

export function sort_selection_numeric() {
	_sort_selection(false, true);
}

export function sort_selection_numeric_desc() {
	_sort_selection(true, true);
}