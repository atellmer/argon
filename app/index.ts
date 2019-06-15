import * as Argon from '../src';


const Timer = Argon.createComponent(({ tick }) => {
	if (tick >= 10 && tick <= 15) {
		return null;
	}

	return Argon.dom`
		<div>Time: ${tick}</div>
	`
});
const render = (props) => Argon.renderComponent(Timer(props), document.getElementById('app'))

let tick = 0;
render({ tick })
setInterval(() => render({ tick: ++tick }), 1000);


