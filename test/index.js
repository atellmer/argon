'use strict';

const test = require('tape');
require('jsdom-global')();
const Spider = require('../lib/spider.umd');

const transformMarkup = (markup) => markup.replace(/\s/gm, '');
const html = (container) => container.innerHTML;


test(`createComponent doesn't throws exeption`, (t) => {
	t.doesNotThrow(() => {
		Spider.unmount();
    Spider.createComponent({
			render() {
				return Spider.dom`
					<div>ChildNode</div>
				`;
			}
		});
  });

  t.end();
});

test(`renderComponent doesn't throws exeption`, (t) => {
	t.doesNotThrow(() => {
		Spider.unmount();
		const $container = document.createElement('div');
    const App = Spider.createComponent({
			displayName: 'App',
			render() {
				return Spider.dom`
					<div>App</div>
				`;
			}
		});

		Spider.renderComponent(App(), $container);
	});

  t.end();
});

test(`renderComponent throws exeption without container node`, (t) => {
	t.throws(() => {
		Spider.unmount();
    const App = Spider.createComponent({
			displayName: 'App',
			render() {
				return Spider.dom`
					<div>App</div>
				`;
			}
		});

		Spider.renderComponent(App());
	});

  t.end();
});

test(`render correctly markup`, (t) => {
	Spider.unmount();
	const $container = document.createElement('div');
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			return Spider.dom`
				<div class="app">
					<div>Header</div>
					<div>Content</div>
					<div>Footer</div>
				</div>
			`;
		}
	});

	Spider.renderComponent(App(), $container);

	const markup = `
		<div class="app" data-spiderid="0" data-spidername="App">
			<div>Header</div>
			<div>Content</div>
			<div>Footer</div>
		</div>
	`;

	t.equal(markup.replace(/\s/gm, ''), $container.innerHTML.replace(/\s/gm, ''));

  t.end();
});

test(`render child component doesn't throws exeption`, (t) => {
	t.doesNotThrow(() => {
		Spider.unmount();
		const $container = document.createElement('div');
		const Node = Spider.createComponent({
			displayName: 'Node',
			render() {
				return Spider.dom`
					<div class="node">
						Node
					</div>
				`;
			}
		});
		const App = Spider.createComponent({
			displayName: 'App',
			render() {
				return Spider.dom`
					<div class="app">
						<div>Header</div>
						${Node()}
					</div>
				`;
			}
		});

		Spider.renderComponent(App(), $container);
	});

  t.end();
});

test(`render correctly markup with child components`, (t) => {
	Spider.unmount();
	const $container = document.createElement('div');
	const Node = Spider.createComponent({
		displayName: 'Node',
		render() {
			return Spider.dom`
				<div class="node">
					Node
				</div>
			`;
		}
	});
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			return Spider.dom`
				<div class="app">
					<div>Header</div>
					<div>
						${Node()}
						${Node()}
						${Node()}
					</div>
					<div>Footer</div>
				</div>
			`;
		}
	});

	Spider.renderComponent(App(), $container);

	const markup = `
		<div class="app" data-spiderid="0" data-spidername="App">
			<div>Header</div>
			<div>
				<div class="node" data-spiderid="0.0" data-spidername="Node">
					Node
				</div>
				<div class="node" data-spiderid="0.1" data-spidername="Node">
					Node
				</div>
				<div class="node" data-spiderid="0.2" data-spidername="Node">
					Node
				</div>
			</div>
			<div>Footer</div>
		</div>
	`;

	t.equal(markup.replace(/\s/gm, ''), $container.innerHTML.replace(/\s/gm, ''));
  t.end();
});

test(`pass correctly props`, (t) => {
	Spider.unmount();
	const $container = document.createElement('div');
	const props = {
		text: 'text',
		count: 100
	};
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			t.deepEqual(this.props, props);

			return Spider.dom`
				<div class="app">
					<div>App</div>
				</div>
			`;
		}
	});

	Spider.renderComponent(App({ ...props }), $container);

  t.end();
});

test(`pass correctly props with repeated render`, (t) => {
	Spider.unmount();
	const $container = document.createElement('div');
	let expected = 'Hello';
	let text = '';
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			text = this.props.text;

			return Spider.dom`
				<div class="xxx">
					<div>${this.props.text}</div>
				</div>
			`;
		}
	});

	Spider.renderComponent(App({ text: 'Hello' }), $container);

	t.equals(text, expected);

	setTimeout(() => {
		expected = 'world';
		Spider.renderComponent(App({ text: 'world' }), $container);

		t.equals(text, expected);
		t.end();
	}, 100);
});

test(`correctly resolve conditional rendering`, (t) => {
	let expected = '';
	let result = '';
	Spider.unmount();
	const $container = document.createElement('div');
	const Node = Spider.createComponent({
		displayName: 'Node',
		render() {
			return Spider.dom`
				<div>Node</div>
			`;
		}
	});
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			const { needRender } = this.props;

			return Spider.dom`
				<div>
					${needRender && Node()}
				</div>
			`;
		}
	});

	Spider.renderComponent(App({ needRender: true }), $container);

	expected = transformMarkup(`
		<div data-spiderid="0" data-spidername="App">
			<div data-spiderid="0.0" data-spidername="Node">Node</div>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equals(result, expected);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 100);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: true }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<div data-spiderid="0.1" data-spidername="Node">Node</div>
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 200);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: true }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<div data-spiderid="0.1" data-spidername="Node">Node</div>
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 300);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 400);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: true }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<div data-spiderid="0.2" data-spidername="Node">Node</div>
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
		t.end();
	}, 500);
});

test(`correctly resolve conditional rendering (case 1)`, (t) => {
	let expected = '';
	let result = '';
	Spider.unmount();
	const $container = document.createElement('div');
	const Node = Spider.createComponent({
		displayName: 'Node',
		render() {
			return Spider.dom`
				<div>Node: ${this.props.text}</div>
			`;
		}
	});
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			const { needRender } = this.props;

			return Spider.dom`
				<div>
					${needRender && Node({text: 'hello'})}
					${!needRender && Node({text: 'world'})}
				</div>
			`;
		}
	});

	Spider.renderComponent(App({ needRender: true }), $container);

	expected = transformMarkup(`
		<div data-spiderid="0" data-spidername="App">
			<div data-spiderid="0.0" data-spidername="Node">Node: hello</div>
			<!--@@spider:empty-->
		</div>
	`);
	result = transformMarkup(html($container));

	t.equals(result, expected);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
				<div data-spiderid="0.1" data-spidername="Node">Node: world</div>
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 100);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
				<div data-spiderid="0.1" data-spidername="Node">Node: world</div>
			</div>
		`);
		result = transformMarkup(html($container));
	
		t.equals(result, expected);
	}, 200);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: true }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<div data-spiderid="0.2" data-spidername="Node">Node: hello</div>
				<!--@@spider:empty-->
			</div>
		`);
		result = transformMarkup(html($container));

		t.equals(result, expected);
		t.end();
	}, 300);
});

test(`correctly resolve conditional rendering (case 2)`, (t) => {
	let expected = '';
	let result = '';
	Spider.unmount();
	const $container = document.createElement('div');
	const Node = Spider.createComponent({
		displayName: 'Node',
		render() {
			return Spider.dom`
				<div>Node: ${this.props.text}</div>
			`;
		}
	});
	const App = Spider.createComponent({
		displayName: 'App',
		render() {
			const { needRender } = this.props;

			return Spider.dom`
				<div>
					${needRender && Node({text: 'hello'})}
					${!needRender && Node({text: 'world'})}
					${needRender && Node({text: 'bitch'})}
				</div>
			`;
		}
	});

	Spider.renderComponent(App({ needRender: true }), $container);

	expected = transformMarkup(`
		<div data-spiderid="0" data-spidername="App">
			<div data-spiderid="0.0" data-spidername="Node">
				Node: hello
			</div>
			<!--@@spider:empty-->
			<div data-spiderid="0.1" data-spidername="Node">
				Node: bitch
			</div>
		</div>
	`);
	result = transformMarkup(html($container));

	t.equals(result, expected);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
				<div data-spiderid="0.2" data-spidername="Node">Node: world</div>
				<!--@@spider:empty-->
			</div>
		`);
		result = transformMarkup(html($container));

		t.equals(result, expected);
	}, 100);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: false }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<!--@@spider:empty-->
				<div data-spiderid="0.2" data-spidername="Node">Node: world</div>
				<!--@@spider:empty-->
			</div>
		`);
		result = transformMarkup(html($container));

		t.equals(result, expected);
	}, 200);

	setTimeout(() => {
		Spider.renderComponent(App({ needRender: true }), $container);

		expected = transformMarkup(`
			<div data-spiderid="0" data-spidername="App">
				<div data-spiderid="0.3" data-spidername="Node">
					Node: hello
				</div>
				<!--@@spider:empty-->
				<div data-spiderid="0.4" data-spidername="Node">
					Node: bitch
				</div>
			</div>
		`);
		result = transformMarkup(html($container));

		t.equals(result, expected);
		t.end();
	}, 300);
});

