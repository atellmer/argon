import * as test from 'tape';
import * as jsdom from 'jsdom-global';

import { transformMarkup, html } from '../../../../test/helpers';
import {
	StatefullComponentFactoryType,
	createComponent,
} from '../../../core/component/component';
import { dom } from './dom';
import { renderComponent } from '../render';

jsdom();


test(`[DOM]: render dom correctly`, (t) => {
	const Component = createComponent({
		render() {
			return dom`
				<div class="app">
					<header class="header">Header</header>
					<div class="content">Content</div>
					<footer class="footer">Footer</footer>
				</div>
			`;
		}
	});
	
	const $container = document.createElement('div');
	renderComponent(Component() as StatefullComponentFactoryType, $container);

	const expected = transformMarkup(`
		<div class="app" data-argonid="0">
			<header class="header">Header</header>
			<div class="content">Content</div>
			<footer class="footer">Footer</footer>
		</div>
	`);
	const result = transformMarkup(html($container));

	t.equal(expected, result);
  t.end();
});

test(`[DOM]: render list of components`, (t) => {
	let expected = null;
	let result = null;
	let $container = null;

	const Item = createComponent(() => {
		return dom`
			<div>I am item</div>
		`;
	});

	const List1 = createComponent({
		render() {
			return dom`
				<div>
					${Array(5).fill(null).map(x => Item())}
				</div>
			`;
		}
	});
	
	$container = document.createElement('div');
	renderComponent(List1() as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div data-argonid="0">
			<div>I am item</div>
			<div>I am item</div>
			<div>I am item</div>
			<div>I am item</div>
			<div>I am item</div>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equal(expected, result, 'render simple list correctly');

	const List2 = createComponent({
		render() {
			return dom`
				<div>
					${Array(5).fill(null).map(x => dom`
						<span>${Item()}</span>
					`)}
				</div>
			`;
		}
	});

	$container = document.createElement('div');
	renderComponent(List2() as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div data-argonid="0">
			<span><div>I am item</div></span>
			<span><div>I am item</div></span>
			<span><div>I am item</div></span>
			<span><div>I am item</div></span>
			<span><div>I am item</div></span>
		</div>
		`);
	result = transformMarkup(html($container));

	t.equal(expected, result, 'render simple list with wrapper for items correctly');

	const List3 = createComponent({
		render() {
			return dom`
				<div>
					${Array(5).fill(null).map((x, idx) => Item({ key: idx }))}
				</div>
			`;
		}
	});

	$container = document.createElement('div');
	renderComponent(List3() as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div data-argonid="0">
			<div key="0">I am item</div>
			<div key="1">I am item</div>
			<div key="2">I am item</div>
			<div key="3">I am item</div>
			<div key="4">I am item</div>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equal(expected, result, 'passes keys to nodes');

	$container = document.createElement('div');

	t.doesNotThrow(() => {
		const List = createComponent({
			render() {
				return dom`
					<div>
						${Array(10000).fill(null).map(x => Item())}
					</div>
				`;
			}
		});
		renderComponent(List() as StatefullComponentFactoryType, $container);
	}, 'render large list without exeption');

  t.end();
});

test(`[DOM]: render dom with conditions`, (t) => {
	let expected = null;
	let result = null;
	let $container = document.createElement('div');

	const Component = createComponent({
		render() {
			const { isOpen } = this.props;

			return dom`
				<div class="app">
					<header class="header">Header</header>
					${isOpen && dom`<div class="content">Content</div>`}
					${!isOpen && dom`<div>haha lol</div>`}
					<footer class="footer">Footer</footer>
				</div>
			`;
		}
	});

	renderComponent(Component({ isOpen: true }) as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div class="app" data-argonid="0">
			<header class="header">Header</header>
			<div class="content">Content</div>
			<!--@argon:empty-->
			<footer class="footer">Footer</footer>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equal(expected, result);

	renderComponent(Component({ isOpen: false }) as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div class="app" data-argonid="0">
			<header class="header">Header</header>
			<!--@argon:empty-->
			<div>haha lol</div>
			<footer class="footer">Footer</footer>
		</div>
	`);

	result = transformMarkup(html($container));

	t.equal(expected, result);
  t.end();
});



test(`[DOM]: remove nodes by keys`, (t) => {
	let expected = null;
	let result = null;
	let $container = document.createElement('div');
	const Item = createComponent(({ id }) => {
		return dom`
			<span>item ${id}</span>
		`
	})

	const App = createComponent({
		render() {
			const { items } = this.props;

			return dom`
				<div>
					${items.map(x => Item({key: x, id: x}))}
				</div>
			`;
		}
	});

	renderComponent(App({ items: [0, 1, 2, 3, 4, 5] }) as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div data-argonid="0">
			<span key="0">item 0</span>
			<span key="1">item 1</span>
			<span key="2">item 2</span>
			<span key="3">item 3</span>
			<span key="4">item 4</span>
			<span key="5">item 5</span>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equal(expected, result);

	renderComponent(App({ items: [0, 1, 3, 5] }) as StatefullComponentFactoryType, $container);

	expected = transformMarkup(`
		<div data-argonid="0">
			<span key="0">item 0</span>
			<span key="1">item 1</span>
			<span key="3">item 3</span>
			<span key="5">item 5</span>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equal(expected, result);
  t.end();
});
