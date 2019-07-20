import * as test from 'tape';
import * as jsdom from 'jsdom-global';

import { createComponent, repeat } from '../../../core/component/component';
import { dom } from '../dom/dom';
import { renderComponent } from './render';
import { transformMarkup, html } from '../../../../test/helpers';


jsdom();

test(`[Render]: internal render`, t => {
  const DOMElement = document.createElement('div');
  const DOMElementPortal = document.createElement('div');

  t.doesNotThrow(() => {
    const InternalRender = createComponent(({ text }) => dom`<div>${text}</div>`);

    const App = createComponent(({ isOpen }) => {
      renderComponent(
        InternalRender({ text: isOpen ? 'on' : 'off' }),
        DOMElementPortal
      );

      return dom`
        <div class="app">
          <div>App</div>
        </div>`;
    });

    renderComponent(App({ isOpen: false }), DOMElement);
    renderComponent(App({ isOpen: true }), DOMElement);

    const expected = transformMarkup(`<div>on</div>`);
    const result = transformMarkup(html(DOMElementPortal));

    t.equal(expected, result, 'correct render');
    t.end();
  });
});
