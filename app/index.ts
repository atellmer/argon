import * as Argon from "../src";

const Item = Argon.createComponent(({x = 1}) => {
	return Argon.dom`
		<div class="item">
			<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
		</div>
	`;
});

const Header = Argon.createComponent(({  }) => {
	return Argon.dom`
		<div>Header</div>
	`
});

const App = Argon.createComponent(({ isOpen }) => {

	const renderNode = () => Argon.dom`
		<div>
			Text
			${Header()}
			${Argon.repeat([3,4,5], (x) => Item({ key: x, x }))}
		</div>
	`

	return Argon.dom`
		<div class="app">
			<div>App</div>
			${isOpen && Argon.insert(renderNode)}
			${Argon.repeat([1,2,3], (x) => Item({ key: x, x }))}
			<div>Footer</div>
		</div>
	`;
});

Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));
}, 1000)

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 2000)















