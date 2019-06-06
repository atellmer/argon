import * as Argon from '../src';


const Header = Argon.createComponent({
	displayName: 'Header',
	render() {
		return Argon.dom`
			<header>Header</header>
		`;
	}
})

const Footer = Argon.createComponent((props) => {
	return Argon.dom`
		<div>Footer</div>
	`
})


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({ count: 0 }),
	handleClick() {
		this.setState({ count: this.state.count + 1 });
		console.log('click', );
	},
	render() {
		const { count } = this.state;

		return Argon.dom`
			<div>
				${Header({})}
				<div>Count: ${count}<div>
				<button on:click="${this.handleClick}">Click me</button>
				${Footer({myProp: '555'})}
			</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
