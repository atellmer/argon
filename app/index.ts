import * as Argon from '../src';


const Header = Argon.createComponent({
	displayName: 'Header',
	render() {
		return Argon.dom`
			<header>Header</header>
		`;
	}
})

const Item = Argon.createComponent(({ id }) => {
	return Argon.dom`
		<div>Item {id}</div>
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
				${[1,2,3,4].map(x => Item({id: x}))}
			</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
