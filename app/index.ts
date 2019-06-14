import * as Argon from '../src';


const Item = Argon.createComponent(({ id, onRemove }) => {
	const handleClick = () => {
		console.log('remove', id)
		onRemove(id);
	};

	return Argon.dom`
		<div>
			Item: ${id}
			<button on:click="${handleClick}">remove: ${id}</button>
		</div>
	`
}, { displayName: 'Item' });


const App = Argon.createComponent(({ items, setItems }) => {
	const handleRemove = (id) => setItems(items.filter(x => x !== id));

	return Argon.dom`
		<div class="app">
			<div>App</div>
			${items.map(x => Item({ key: x, id: x, onRemove: handleRemove }))}
			<div>-----</div>
		</div>
	`
}, { displayName: 'App' });


let state = {
	items: Array(10).fill(null).map((_, idx) => idx)
};
const render = (...args) => Argon.renderComponent(App(...args), document.getElementById('app'))
const setItems = (items) => {
	state = {
		...state,
		items: [...items]
	};
	render({ items: state.items, setItems: setItems });
};

render({ items: state.items, setItems: setItems });
