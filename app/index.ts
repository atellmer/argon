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
  return Argon.dom`
    <div>item: ${x}</div>
  `
});

const List = Argon.createComponent(({ isOpen }) => {
  return Argon.dom`
    ${['text', 123, 'zzz']}
  `
});

const App = Argon.createComponent(({ isOpen }) => {
  return Argon.dom`
    ${isOpen ? ['text', 123, 'zzz'] : `<span>xxx</span>`}
  `
});

Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));

setTimeout(() => {
  Argon.renderComponent(App({ isOpen: false }), document.getElementById('app'));
}, 1000)

setTimeout(() => {
  Argon.renderComponent(App({ isOpen: true }), document.getElementById('app'));
}, 2000)


