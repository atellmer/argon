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
		<div>Item ${id}</div>
	`
})


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({ items: [1,2,3,4,5,6] }),
	handleRemove(x) {
		return () => {
			this.setState({ items: this.state.items.filter(v => v !== x)});
		}
	},
	render() {
		const { items } = this.state;

		return Argon.dom`
			<div>
				${items.map(x => Argon.dom`
					<span key="${x}">
						${Item({id: x})}
						<button on:click="${this.handleRemove(x)}">remove</button>
					</span>
				`)}
			</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
