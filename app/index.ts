import * as Argon from '../src';


const Content = Argon.createComponent(() => {
	return Argon.dom`
		<div>Content</div>
	`;
})

const Item = Argon.createComponent(({ id, onRemove }) => {
	return Argon.dom`
		<div>
			Item ${id}
			<button on:click="${onRemove(id)}">remove</button>
		</div>
	`
}, { displayName: 'Item', defaultProps: { id: -1 } });


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({
		isOpen: false,
		items: Array(10).fill(null).map((v, idx) => idx)
	}),
	handleRemove(x) {
		return () => {
			this.setState({ items: this.state.items.filter(v => v !== x)});
		}
	},
	handleOpen() {
		this.setState({ isOpen: !this.state.isOpen });
	},
	render() {
		const { isOpen, items } = this.state;

		return Argon.dom`
			<div>
				${items.map(x => Item({key: x, id: x, onRemove: this.handleRemove}))}
				${isOpen && Content()}
				<button on:click="${this.handleOpen}">${isOpen ? 'Close' : 'Open'}</button>
			</div>
		`;
	}
});


Argon.renderComponent(App(), document.getElementById('app'));
