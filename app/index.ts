import * as Argon from '../src';


const Item = Argon.createComponent(({ id }) => {
	return Argon.fragment(Argon.dom`
		<div>fragment ${id} start</div>	
		<div>fragment ${id} end</div>
		<button on:click="${() => console.log('click', id)}">Click</button>
	`)
}, { displayName: 'Item' });


const App = Argon.createComponent(({ isOpen }) => {

	return Argon.fragment(Argon.dom`
		<div>App</div>
		${Item({ id: 1 })}
		${isOpen && Item({ id: 2 })}
		<div>
			<div>
				${Item({ id: 3 })}
			</div>
		</div>
	`)
}, { displayName: 'App' });


const render = (...args) => Argon.renderComponent(App(...args), document.getElementById('app'))

render({ isOpen: false });

//setTimeout(() => render({ isOpen: true }), 1000)
//setTimeout(() => render({ isOpen: false }), 2000)
//setTimeout(() => render({ isOpen: true }), 3000)
