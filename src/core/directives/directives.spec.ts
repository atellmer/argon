import * as jsdom from 'jsdom-global';
import * as test from 'tape';

import { createComponent } from '../component/component';
import { repeat } from '../directives/directives';
import { repeatorScope, setCurrentMountedRoute } from '../scope/scope';
import { transformTemplateStringToVirtualDOM, VirtualNodeType } from '../vdom/vdom';

jsdom();

const dom = (str: TemplateStringsArray, ...args: any[]) => transformTemplateStringToVirtualDOM(str, ...args);
const render = app => dom`${app()}`;
const resetScope = () => {
  setCurrentMountedRoute([0]);
  repeatorScope.reset();
};
const Item = createComponent(x => {
  return dom`<div>${x}</div>`;
});

test(`[Directives]: repeat directive doesn't not throws`, t => {
  const List = createComponent(() => {
    return dom`${repeat([1, 2], x => Item({ x, key: x }))}`;
  });

  t.doesNotThrow(() => {
    resetScope();
    render(List);
    t.end();
  });
});

test(`[Directives]: repeat directive render correctly`, t => {
  const Item = createComponent(x => {
    return dom`<div>${x}</div>`;
  });
  const ListLevelThree = createComponent(() => {
    return dom`${repeat([111, 222], x => Item({ x, key: x }))}`;
  });
  const ListLevelTwo = createComponent(() => {
    return dom`${repeat([11, 22, 33], x => ListLevelThree({ key: x }))}`;
  });
  const ListLevelOne = createComponent(() => {
    return dom`${repeat([1, 2], x => ListLevelTwo({ key: x }))}`;
  });
  const App = createComponent(() => {
    return dom`
      <root>
        <div>1</div>
        ${ListLevelOne()}
        ${ListLevelThree()}
        <div>2</div>
        ${repeat([1, 2, 3], x => Item({ x, key: x }))}
        ${repeat([1, 2, 3, 4], x => dom`<div>${x}</div>`)}
        <div>3</div>
        <div>4</div>
      </root>
    `;
  });
  const expectedNodeIds = [
    '0.0.0', // empty text node with '/n'
    '0.0.1',
    '0.0.2:0',
    '0.0.2:1',
    '0.0.2:2',
    '0.0.2:3',
    '0.0.2:4',
    '0.0.2:5',
    '0.0.2:6',
    '0.0.2:7',
    '0.0.2:8',
    '0.0.2:9',
    '0.0.2:10',
    '0.0.2:11',
    '0.0.3:0',
    '0.0.3:1',
    '0.0.4',
    '0.0.5:0',
    '0.0.5:1',
    '0.0.5:2',
    '0.0.6:0',
    '0.0.6:1',
    '0.0.6:2',
    '0.0.6:3',
    '0.0.7',
    '0.0.8',
  ];

  resetScope();
  const vNode = render(App) as VirtualNodeType;
  const actualNodeIds = vNode.children.map(vNode => vNode.id);

  t.equals(vNode.children.length, 26, 'render right number of children');

  t.deepEquals(actualNodeIds, expectedNodeIds, 'node ids set correctly');

  const actualDeepChildNodeIds = [
    vNode.children[2].children[0].id,
    vNode.children[3].children[0].id,
    vNode.children[14].children[0].id,
  ];
  const expectedDeepChildNodeIds = ['0.0.2.0.0', '0.0.2.1.0', '0.0.3.0.0'];

  t.deepEquals(actualDeepChildNodeIds, expectedDeepChildNodeIds, 'deep child node id set correctly');
  t.end();
});
