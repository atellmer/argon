import * as Argon from "../src";

const Item = Argon.createComponent(({x}) => {
	return Argon.dom`
		<div class="item">
			<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
		</div>
	`;
});

const App = Argon.createComponent(({ isOpen }) => {

	if (!isOpen) return null;

  return Argon.dom`some text`;
});

Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 1000)

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));
}, 2000)


















