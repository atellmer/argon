import * as Argon from '../src';


let state = {
	items: Array(1000).fill(null).map((_, idx) => idx)
};

const Item = Argon.createComponent(({ id, onRemove }) => {
	const handleClick = () => {
		onRemove(id);
	};

	return Argon.dom`
		<div>
			Item: ${id}
			<button on:click="${handleClick}">remove</button>
		</div>
	`
}, { displayName: 'Item' });


const App = Argon.createComponent(({ items, setItems }) => {

	const handleRemove = (id) => {

		console.log('remove', id)
		setItems(items.filter(x => x !== id));
	}

	return Argon.dom`
		<div class="app">
			<div>App</div>
			${items.map(x => Item({ key: x, id: x, onRemove: handleRemove }))}
			<div>-----</div>
		</div>
	`
}, { displayName: 'App' });


const setItems = (items) => {
	state = {
		...state,
		items: [...items]
	};
	Argon.renderComponent(App({ items: state.items, setItems }), document.getElementById('app'));
};

Argon.renderComponent(App({ items: state.items, setItems }), document.getElementById('app'));

/*
setTimeout(() => {
	Argon.renderComponent(App({ text: 'zzz' }), document.getElementById('app'));
}, 1000)*/

