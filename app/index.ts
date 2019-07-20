import * as Argon from "../src";

const Item = Argon.createComponent(({x}) => {
	return Argon.dom`
		<div class="item">
			<button on:click="${() => console.log('click: ', x)}">Item: ${x}</button>
		</div>
	`;
});

const App = Argon.createComponent(({ isOpen }) => {

  return Argon.dom`some text`;
});

Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));



















