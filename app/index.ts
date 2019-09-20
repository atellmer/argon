import * as Argon from '../src';
import {
  dom,
  repeat,
  insert,
  createComponent,
  renderComponent,
} from '../src';


// const getAttrs = props => {
//   const propsNameMap = {
//     className: 'class',
//   };

//   const attrs = Object.keys(props).reduce((acc, key) => {
//     const attrName = propsNameMap[key] || key;
//     const str = acc + `${attrName}="${props[key]}";`;

//     return str;
//   }, '');

//   return attrs;
// };

// const run = (render) => Argon.dom`${render()}`;

// const View = Argon.createComponent(({ props = {}, children = () => null }) => {
//   return Argon.dom`
// 		<div ${getAttrs(props)}>${children}</div>
// 	`;
// });

// const Appbar = Argon.createComponent(({ props = {}, children = () => null }) => {
//   const render = () => {
//     return View({
//       props: {
//         style: 'width: 100%; height: 64px; background-color: blueviolet; color: #fff',
//       },
//       children,
//     });
//   };
//   return Argon.dom`${render()}`;
// });

// const Image = Argon.createComponent(({ props = {} }) => {
//   return Argon.dom`
// 		<img ${getAttrs(props)} />
// 	`;
// });

// const Text = Argon.createComponent(({ props = {}, children = () => null }) => {
//   return Argon.dom`
// 		<span ${getAttrs(props)}>${children}</span>
// 	`;
// });

// const App = Argon.createComponent(({ isFetching }) => {
//   const main = () => (
//     View({
//       children: [
//         Appbar({
//           children: Text({
//             children: 'App title',
//           }),
//         }),
//         View({
//           props: { style: 'color: blue' },
//           children:
//             isFetching
//               ? Text({
//                   children: 'Loading...',
//                 })
//               : Image({
//                   props: {
//                     style: 'width: 100%; max-width: 100%',
//                     src: 'https://wallimpex.com/data/out/564/animals-images-9256782.jpg',
//                   },
//                 }),
//         }),
//       ],
// 		})
//   );

//   return run(main);
// });

// Argon.renderComponent(App({ isFetching: true }), document.getElementById('app'));

// setTimeout(() => {
//   Argon.renderComponent(App({ isFetching: false }), document.getElementById('app'));
// }, 2000);


const Portal = Argon.createComponent(({ isOpen }) => {
  return Argon.dom`
    <div>Portal: ${isOpen ? 'open' : 'close'}</div>
  `
});
const Item = Argon.createComponent(({ x }) => {
  return Argon.dom`<div>${x}</div>`;
});
const ListLevelThree = Argon.createComponent(() => {
  return Argon.dom`${Argon.repeat([111, 222], x => Item({ x, key: x }))}`;
});
const ListLevelTwo = Argon.createComponent(() => {
  return Argon.dom`${Argon.repeat([11, 22, 33], x => ListLevelThree({ key: x }))}`;
});
const ListLevelOne = Argon.createComponent(({ isOpen }) => {
  Argon.renderComponent(Portal({ isOpen }), document.getElementById('portal'));

  return Argon.dom`${Argon.repeat([1, 2], x => ListLevelTwo({ key: x }))}`;
});

///////////////////////
const TableRoot = createComponent(({ width, child }) => dom`
  <table style="width: ${width}">${child}</table>
`);

const TableHeader = createComponent(({  }) => dom`
  <thead>
    <tr>
      <th style="width: 33.3333%">name</th>
      <th style="width: 33.3333%">age</th>
      <th style="width: 33.3333%">iq</th>
    </tr>
  </thead>
`);

const TableBody = createComponent(({ child }) => dom`
  <tbody>
    ${child}
  </tbody>
`);

const Table = {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
};

const App = createComponent(() => {
  const rows = [1, 2, 3];
  const cols = [1, 2, 3];
  return dom`
    ${Table.Root({ width: '100%', child: [
        Table.Header(),
        Table.Body({ child: repeat(rows, r => dom`
            <tr>${repeat(cols, c => dom`<td>${r}:${c}</td>`)}</tr>
          `),
        }),
      ],
    })
  }`;
});

renderComponent(App({ isOpen: true }), document.getElementById('app'));

// bug with [0,0,0]
// error ids in nested
