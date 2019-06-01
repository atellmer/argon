import * as test from 'tape';

import { createComponent } from './component';


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
	t.equal(Component().isArgonComponent, true, 'is argon component');

  t.end();
});

test(`[Component]: createInstance creates an instance correctly`, (t) => {
	const Component = createComponent({
		render() {
			return null;
		}
	});
	const instance = Component().createInstance();

	t.equal(typeof instance, 'object', 'instance is object');
	t.equal(instance.render(), null, 'render returns value correctly');
	t.throws(() => {
		createComponent({} as any)().createInstance().render();
	}, 'throws exeption if render method not defined');

  t.end();
});
