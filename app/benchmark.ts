import {
	createASTFromSource,
} from '../src/core/parser';
import { createElementFromVDOMSource } from '../src/core/dom';


function runBenchmark(container: HTMLElement) {
	const iterations = 10000;
	const parserProfilerName = `parser: ${iterations} rows`;
	const createNodeProfilerName = `createNode: ${iterations} rows`;

	const root = document.createElement('div');
	const node = document.createElement('div');
	node.setAttribute('class', 'app');

	for (let i = 0; i < iterations; i++) {
		const child = document.createElement('div');
		const content = document.createElement('div');
		content.setAttribute('class', 'content');
		content.setAttribute('data-test1', 'content1');
		content.setAttribute('data-test2', 'content2');
		content.setAttribute('data-test3', 'content3');
		const text = document.createTextNode('index: ' + i);
		content.appendChild(text);
		child.appendChild(content)
		node.appendChild(child);
	}

	root.appendChild(node);

	console.time(parserProfilerName)
	const vdom = createASTFromSource(root.innerHTML);
	console.timeEnd(parserProfilerName)

	console.log('vdom', vdom)

	console.time(createNodeProfilerName)
	const app = createElementFromVDOMSource(vdom);
	console.timeEnd(createNodeProfilerName)

	console.log('app', app)

	container.appendChild(app);
}

export {
	runBenchmark
}
