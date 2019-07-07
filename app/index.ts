import * as Argon from '../src';


const Item = Argon.createComponent(({ x }) => {
	return Argon.dom`
		<div>Item: ${x}</div>
	`
});


const Header = Argon.createComponent(() => {
	return Argon.dom`
		<div>
			1
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
			<div class="app">
				<div>App</div>
				${Argon.repeat([1, 2, 3], x => Item({x}))}
				${Footer()}
		</div>
	`
});


Argon.renderComponent(App({}), document.getElementById('app'))


