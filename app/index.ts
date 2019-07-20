import * as Argon from "../src";

const Item = Argon.createComponent(({x}) => {
	return Argon.dom`
		<div class="item">
			<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
		</div>
	`;
});

const App = Argon.createComponent(({ }) => {
  return Argon.dom`
			<div class="app">
				<div>App</div>
		</div>
	`;
});

Argon.renderComponent(App({ }), document.getElementById('app'));



















