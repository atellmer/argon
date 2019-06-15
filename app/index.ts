import * as Argon from '../src';


const Input = Argon.createComponent(({ value, setValue }) => Argon.fragment(
	Argon.dom`
	<input value="${value}" on:input="${setValue}" />
	<div>Text: ${value}</div>
	`
));
const render = (props) => Argon.renderComponent(Input(props), document.getElementById('app'))

let value = '';
const setValue = (e) => {
	value = e.target.value;
	render({ value, setValue })
} 
render({ value, setValue })



//${'\u02c2'}div${'\u02c3'}text${'\u02c2'}${'\u002f'}div${'\u02c3'}


