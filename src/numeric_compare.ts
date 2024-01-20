export class NumericComparator {
	protected numeric_item: number;

	protected _item: string;

	// The getter provides a read-only field called `item`.
	get item() {
		return this._item;
	}

	compare_strings(a: string, b: string): number {
		if (a === b) {
			return 0;
		}
		if (a < b) {
			return -1;
		}

		return 1;
	}

	is_numeric(): boolean {
		let item_a: number = this.numeric_item.valueOf();
		if (!isNaN(item_a)) {
			return true;
		}

		if (this.item.trimStart().startsWith("NaN")) {
			return true;
		}

		return false;
	}

	compare_nums(a: number, b: number): number {
		if (isNaN(a)) {
			return -1;
		}
		if (isNaN(b)) {
			return 1;
		}

		return a - b;
	}

	compare(b: NumericComparator): number {
		let item_a: number = this.numeric_item.valueOf();
		let item_b: number = b.numeric_item.valueOf();
		let item_a_numeric: boolean = this.is_numeric();
		let item_b_numeric: boolean = b.is_numeric();
		let item_a_nan: boolean;
		let item_b_nan: boolean;

		if (item_a_numeric && item_b_numeric) {
			return this.compare_nums(item_a, item_b);
		}

		if (!item_a_numeric && !item_b_numeric) {
			return this.compare_strings(this.item.trimStart(),
				b.item.trimStart());
		}

		if (item_a_numeric) {
			return 1;
		}

		return -1;
	}

	constructor(item: string) {
		this._item = item;
		this.numeric_item = Number(item);
		if (isNaN(this.numeric_item)) {
			let trimmed: string = this._item.trim();
			if (!trimmed.startsWith("NaN")) {
				// This could mean there is non-numeric text after the number.
				this.numeric_item = Number.parseFloat(trimmed);
			}
		}
	}
}

export function sort_numerically(lines: string[]): string[] {
	let items: NumericComparator[] = [];

	for (let line of lines) {
		items.push(new NumericComparator(line));
	}

	items.sort((a: NumericComparator, b: NumericComparator): number => {
		return a.compare(b);
	});

	let new_lines: string[] = [];
	for (let item of items) {
		new_lines.push(item.item);
	}

	return new_lines;
}

