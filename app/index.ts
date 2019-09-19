import * as Argon from '../src';

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



const Item = Argon.createComponent(({ x }) => {
  return Argon.dom`<div>${x}</div>`;
});
const ListLevelThree = Argon.createComponent(() => {
  return Argon.dom`${Argon.repeat([111, 222], x => Item({ x, key: x }))}`;
});
const ListLevelTwo = Argon.createComponent(() => {
  return Argon.dom`${Argon.repeat([11, 22, 33], x => ListLevelThree({ key: x }))}`;
});
const ListLevelOne = Argon.createComponent(() => {
  return Argon.dom`${Argon.repeat([1, 2], x => ListLevelTwo({ key: x }))}`;
});
const App = Argon.createComponent(({ isOpen }) => {
  const renderPart = () => Argon.dom`${Argon.repeat(Array(3).fill(0), (x, idx) => Argon.dom`<div>${idx}</div>`)}`;

  return Argon.dom`
    <div>
      ${isOpen ?  Argon.insert(renderPart) : 'loading...'}
      ${Argon.repeat(Array(3).fill(0), (x, idx) => Argon.dom`<div>${idx}</div>`)}
    </div>
  `;
});

Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));

setTimeout(() => {
  Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));
}, 1000)

setTimeout(() => {
  Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 2000)


