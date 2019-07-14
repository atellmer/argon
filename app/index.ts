import * as Argon from "../src";

const Item = Argon.createComponent(({x}) => {
	return Argon.dom`
		<div class="item">
			<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
		</div>
	`;
});

const Footer = Argon.createComponent(() => {
  return Argon.dom`
		<div>
			Footer
		</div>
		`;
});

const InternalRender = Argon.createComponent(({ text }) => {
  return Argon.dom`
		<div>
			InrernalRender: ${text}
		</div>
		`;
});

const App = Argon.createComponent(({ isOpen }) => {
	Argon.renderComponent(InternalRender({ text : isOpen ? 'on' : 'off' }), document.getElementById('app2'));

  return Argon.dom`
			<div class="app">
				<div>App</div>
				${isOpen && Argon.repeat([1,2,3], (x, idx) => Item({key: x, x}))}
				${Footer()}
		</div>
	`;
});

Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 1000)
















