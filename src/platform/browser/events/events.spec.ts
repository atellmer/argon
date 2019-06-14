import * as test from 'tape';
import * as jsdom from 'jsdom-global';
import * as simulant from 'jsdom-simulant';

import { transformMarkup, html } from '../../../../test/helpers';
import {
	StatefullComponentFactoryType,
	createComponent
} from '../../../core/component/component';
import { dom } from '../dom/dom';
import { renderComponent } from '../render';


jsdom();
/*
test(`[Events]: remove nodes by click`, (t) => {
	const $container = document.createElement('div');
	const Item = createComponent(({ id, onRemove }) => {
		return dom`
			<div>
				Item ${id}
				<button id="btn-${id}" on:click="${onRemove(id)}">x</button>
			</div>
		`;
	});
	
	const App = createComponent({
		getInitialState: () => ({ items: [0, 1, 2, 3, 4, 5] }),
		handleRemove(x) {
			return () => {
				this.setState({ items: this.state.items.filter(v => v !== x)});
			}
		},
		render() {
			return dom`
				<div>
					${this.state.items.map(x => Item({ key: x, id: x, onRemove: this.handleRemove }))}
				</div>
			`;
		}
	});

	renderComponent(App() as StatefullComponentFactoryType, $container);

	setTimeout(() => {
		simulant.fire($container.querySelector('#btn-2'), 'click');
		simulant.fire($container.querySelector('#btn-4'), 'click');

		const expected = transformMarkup(`
			<div data-argonid="0">
				<div key="0">
					Item 0
					<button id="btn-0">x</button></div>
				<div key="1">
					Item 1
					<button id="btn-1">x</button>
				</div>
				<div key="3">
					Item 3
					<button id="btn-3">x</button>
				</div>
				<div key="5">
					Item 5
				<button id="btn-5">x</button></div>
			</div>
		`);
		const result = transformMarkup(html($container));
		
		t.equal(expected, result);
		t.end();
	});
});*/