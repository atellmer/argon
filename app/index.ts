import * as Argon from '../src';


const Header = Argon.createComponent({
	displayName: 'Header',
	render() {
		return Argon.dom`
			<header>Header</header>
		`;
	}
})

const Item = Argon.createComponent(({ id, onRemove }) => {
	return Argon.dom`
		<div>
			Item ${id}
			<button on:click="${onRemove(id)}">remove</button>
		</div>
	`
})


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({ items: Array(1000).fill(null).map((v, idx) => idx) }),
	handleRemove(x) {
		return () => {
			this.setState({ items: this.state.items.filter(v => v !== x)});
		}
	},
	render() {
		const { items } = this.state;

		return Argon.dom`
			<div>
				${items.map(x => Item({ key: x, id: x, onRemove: this.handleRemove }))}
			</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
