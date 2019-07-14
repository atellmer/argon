import * as test from 'tape';
import * as jsdom from 'jsdom-global';

import { VDOM_ACTIONS } from '../../core/constants/constants';
import { createVirtualDOMFromSource, getVirtualDOMDiff } from './vdom';


jsdom();

test(`[VDOM]: remove nodes by keys without excess actions`, (t) => {
	const { REMOVE_NODE } = VDOM_ACTIONS;
	const vNode = createVirtualDOMFromSource(`
		<div>
			<span key="0">item 0</span>
			<span key="1">item 1</span>
			<span key="2">item 2</span>
			<span key="3">item 3</span>
			<span key="4">item 4</span>
			<span key="5">item 5</span>
		</div>
	`)[0];
	const nextVNode = createVirtualDOMFromSource(`
		<div>
			<span key="1">item 1</span>
			<span key="3">item 3</span>
			<span key="5">item 5</span>
		</div>
	`)[0];
	const expected = [
		{ action: REMOVE_NODE },
		{ action: REMOVE_NODE },
		{ action: REMOVE_NODE }
	];

	const diff = getVirtualDOMDiff(vNode, nextVNode);
	const expectedKeys = [0, 2, 4];
	const resultKeys = diff.map(x => +x.oldValue.attrs['key']);
	const result = diff.map(x => ({ action: x.action }));

	t.deepEqual(expected, result);
	t.deepEqual(expectedKeys, resultKeys)
  t.end();
});
