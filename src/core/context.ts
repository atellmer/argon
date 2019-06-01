import { createComponent } from './component';


function createContext(initialValue: any) {
	let contextValue = initialValue;
	const getValue = () => contextValue;
	const Provider = createComponent({
		displayName: 'Context.Provider',
		willReceiveProps(nextProps) {
			contextValue = nextProps.value || contextValue;
		},
		render() {
			return this.props.children();
		}
	});
	const Consumer = createComponent({
		displayName: 'Context.Consumer',
		render() {
			return this.props.children(contextValue);
		}
	});

	return {
		getValue,
		Provider,
		Consumer
	};
}


export {
	createContext
}
