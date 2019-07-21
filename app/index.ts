import * as Argon from "../src";



// const View = Argon.createComponent(({props = {}, children = () => null}) => {
// 	const propsNameMap = {
// 		'className': 'class',
// 	};

// 	const attrs = Object.keys(props).reduce((acc, key) => {
// 		const attrName = propsNameMap[key] || key;
// 		const str = acc + `${attrName}="${props[key]}";`

// 		return str;
// 	}, '');

// 	return Argon.dom`
// 		<div ${attrs}>${children()}</div>
// 	`
// });

// const App = Argon.createComponent(({ isOpen }) => {
// 	const render = () => {
// 		return View({
// 			props: {
// 				className: 'xxx',
// 				style: 'color: red'
// 			},
// 			children: () => [
// 				'Hello',
// 				View({
// 					props: { style: 'color: blue' },
// 					children: () => 'some text'
// 				}),
// 				'world',
// 			]
// 		});
// 	};

// 	return Argon.dom`${render()}`;
// });

//Argon.renderComponent(App(), document.getElementById('app'));
const Item = Argon.createComponent(({ x }) => {
	return Argon.dom`
		<div>item: ${x}</div>
	`
});

const List = Argon.createComponent(({ x }) => {
	return Argon.dom`
		${Argon.repeat([1,2,3], (v, idx) => Item({x: x + v, key: v}))}
	`
});

const Header = Argon.createComponent(({ isOpen }) => {
	return Argon.dom`${Argon.repeat([1,2,3], (x) => List({x, key: x}))}`
});

const App = Argon.createComponent(({ isOpen }) => {
	return Argon.dom`
		<div class="app">
			${Header({ })}
		</div>
	`
});

Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));

