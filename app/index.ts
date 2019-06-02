import * as Argon from '../src';


const App = Argon.createComponent({
	displayName: 'App',
	render() {
		return Argon.dom`
			<div>Hello Argon</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
