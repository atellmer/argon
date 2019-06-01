import * as Argon from '../src';


const App = Argon.createComponent({
	displayName: 'App',
	render() {
		return null;
	}
});

console.log('App:', App().createInstance());