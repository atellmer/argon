import * as Argon from "../src";



const Div = Argon.createComponent(({props = {}, children = () => null}) => {
	const propsNameMap = {
		'className': 'class',
	};

	const attrs = Object.keys(props).reduce((acc, key) => {
		const attrName = propsNameMap[key] || key;
		const str = acc + `${attrName}="${props[key]}";`

		return str;
	}, '');

	return Argon.dom`
		<div ${attrs}>${children()}</div>
	`
});

const App = Argon.createComponent(({ isOpen }) => {
	const render = () => {
		return Div({
			props: {
				className: 'xxx',
				style: 'color: red'
			},
			children: () => [
				'text',
				Div({
					props: { style: 'color: blue' },
					children: () => 'some text'
				}),
				'bbbbb'
			]
		});
	};

	return Argon.dom`${render()}`;
});

Argon.renderComponent(App(), document.getElementById('app'));

















