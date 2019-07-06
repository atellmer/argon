import * as Argon from '../src';


const Item = Argon.createComponent(() => {
	return Argon.dom`
		<div>Item</div>
	`
});


const Header = Argon.createComponent(() => {
	return Argon.dom`
		<div>
			${Argon.list(() => [1, 2, 3, 4, 5].map(x => Argon.dom`<div xxx="">item: ${x}</div>`))}
		</div>
	`
});

const Footer = Argon.createComponent(() => {
	return Argon.dom`
		<div>
			Footer
		</div>
	`
});

const App = Argon.createComponent(() => {

	return Argon.dom`
		<div>
			${Header()}
			<div>App</div>
			${Footer()}
		</div>
	`
});


Argon.renderComponent(App({}), document.getElementById('app'))


