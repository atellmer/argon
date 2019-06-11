import * as test from 'tape';

import {
	StatefullComponentFactoryType,
	StatelessComponentFactoryType,
	createComponent,
} from './component';


test(`[Component]: createComponent doesn't throws exeption`, (t) => {
	t.doesNotThrow(() => {
    createComponent({
			render() {
				return null;
			}
		});
  });

  t.end();
});

test(`[Component]: createComponent returns factory`, (t) => {
	const Component = createComponent({
		render() {
			return null;
		}
	});

	t.equal(typeof Component(), 'object', 'value is object');
	t.equal((Component() as StatefullComponentFactoryType).isStatefullComponent, true, 'is argon component');

  t.end();
});

test(`[Component]: createInstance creates an instance correctly`, (t) => {
	const Component = createComponent({
		render() {
			return null;
		}
	});
	const instance = (Component() as StatefullComponentFactoryType).createInstance();

	t.equal(typeof instance, 'object', 'instance is object');
	t.equal(instance.render(), null, 'render returns value correctly');
	t.throws(() => {
		(createComponent({} as any)() as StatefullComponentFactoryType).createInstance().render();
	}, 'throws exeption if render method not defined');

  t.end();
});

test(`[Component]: custom fields pass to instance correctly`, (t) => {
	const Component = createComponent({
		myCustomProp: true,
		render() {
			return null;
		}
	} as any);
	const instance = (Component() as StatefullComponentFactoryType).createInstance();

	t.equal((instance as any).myCustomProp, true, 'has myCustomProp');
  t.end();
});

test(`[Component]: create stateless component correctly`, (t) => {
	const Component = createComponent(() => null);
	const element = (Component() as StatelessComponentFactoryType).createElement();

	t.equal(typeof Component, 'function', 'stateless component is function');
	t.equal(element, null, 'element render correctrly');
  t.end();
});

test(`[Component]: pass options correctly`, (t) => {
	const Component = createComponent(() => null, { displayName: 'App', defaultProps: { myProp: 'hello' } });
	const factory = Component() as StatelessComponentFactoryType;

	t.equal(Object.keys(factory.props).some(propName => propName === 'myProp' && factory.props[propName] === 'hello'), true, 'passes props');
	t.equal(factory.displayName, 'App', 'has displayName');
  t.end();
});

