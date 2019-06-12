import * as Argon from '../src';



const Item = Argon.createComponent(({ id, onRemove }) => {
	return Argon.dom`
		<div>
			Item: ${id}
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
		const { items } = this.state;
		const { isOpen } = this.props;

		return Argon.dom`
			<div>
				${items.map(x => Item({key: x, id: x, onRemove: this.handleRemove}))}
			</<div>
		`;
	}
});

Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));

/*
setTimeout(() => {
	Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 1000)*/

/*
setTimeout(() => {
	Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));
}, 2000)*/
