import * as Argon from "../src";

const Item = Argon.createComponent(({x}) => {
  return Argon.dom`
		<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
	`;
});

const Footer = Argon.createComponent(() => {
  return Argon.dom`
		<div>
		Footer
		</div>
		`;
});

const App = Argon.createComponent(({ isOpen }) => {

  return Argon.dom`
			<div class="app">
				<div>App</div>
				${isOpen && Argon.repeat([1, 2, 3],x => Item({x}))}
				${Footer()}
		</div>
	`;
});

Argon.renderComponent(App({ isOpen: false }), document.getElementById("app"));

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById("app"));
}, 1000)

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: false }), document.getElementById("app"));
}, 2000)

setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById("app"));
}, 3000)














