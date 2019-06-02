import * as Argon from '../src';


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({ count: 0 }),
	didMount() {
		console.log('didMount', )
		setInterval(() => {
			this.setState({ count: this.state.count + 1 });
		}, 1000)
	},
	render() {
		const { count } = this.state;

		return Argon.dom`
			<div>
				Hello Argon
				<div>Count: ${count}<div>
			</div>
		`;
	}
});

Argon.renderComponent(App(), document.getElementById('app'));
