import * as Argon from '../src';


const App = Argon.createComponent({
	displayName: 'App',
	customProp: () => {},
	render() {
		return null;
	}
});

console.log('App:', App().createInstance());