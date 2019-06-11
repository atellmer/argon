import * as Argon from '../src';


const Content = Argon.createComponent(() => {
	return Argon.dom`
		<div>Content</div>
	`;
})

const Item = Argon.createComponent(({ id, onRemove }) => {
	return Argon.dom`
		<div>
			Item ${id}
			<button on:click="${onRemove(id)}">remove</button>
		</div>
	`
}, { displayName: 'Item', defaultProps: { id: -1 } });

const Drag = Argon.createComponent({
	displayName: 'Drag',
	getInitialState: () => ({
		dragStarted: false,
		x: 200,
		y: 200
	}),
	getDefaultProps: () => ({ color: '#ccc' }),
	handleMouseDown() {
		this.setState({ dragStarted: true });

		const moveAt = (e) => {
			const { dragStarted } = this.state;

			if (dragStarted) {
				this.setState({
					y: e.pageY,
					x: e.pageX
				});
			}
		}

		document.onmousemove = (e) => moveAt(e);
	},
	handleMouseUp() {
		this.setState({ dragStarted: false });
		document.onmousemove = null;
	},
	render() {
		const { x, y, dragStarted } = this.state;
		const { text, color } = this.props;
		const styleObj = {
			'position': 'absolute',
			'top': `${y - 100}px`,
			'left': `${x - 100}px`,
			'width': '200px',
			'height': '200px',
			'background-color': color,
			'color': '#fff',
			'z-index': dragStarted ? 200 : 100,
			'display': 'flex',
			'justify-content': 'center',
			'align-items': 'center',
			'user-select': 'none',
			'cursor': 'grab',
			'border-radius': '50%',
			'box-shadow': '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
		};
		const style = Object.keys(styleObj).map((key) => `${key}: ${styleObj[key]}`).join(';');

		//console.log('dragStarted', dragStarted)

		return Argon.dom`
			<div
				style="${style}"
				on:mousedown="${this.handleMouseDown}"
				on:mouseup="${this.handleMouseUp}">
				${text}
				<br />
				Drag me! (x: ${x}, y: ${y})
			</div>
		`;
	}
});


const App = Argon.createComponent({
	displayName: 'App',
	getInitialState: () => ({
		isOpen: false,
		items: Array(10).fill(null).map((v, idx) => idx)
	}),
	handleRemove(x) {
		return () => {
			this.setState({ items: this.state.items.filter(v => v !== x)});
		}
	},
	handleOpen() {
		this.setState({ isOpen: !this.state.isOpen });
	},
	render() {
		const { isOpen, items } = this.state;

		return Argon.dom`
			<div>
				${Drag({ text: 'Hello', color: 'blueviolet' })}
				<button on:click="${this.handleOpen}">${isOpen ? 'Close' : 'Open'}</button>
			</div>
		`;
	}
});


Argon.renderComponent(Drag({ text: 'Hello', color: 'blueviolet' }), document.getElementById('app'));
