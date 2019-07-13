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

const App = Argon.createComponent(() => {
  return Argon.dom`
			<div class="app">
				<div>App</div>
				${Argon.repeat([1, 2, 3],x => Argon.dom`
					<div key="${x}">${Item({x})}<div>
				`)}
				${Footer()}
		</div>
	`;
});

Argon.renderComponent(App({}), document.getElementById("app"));
