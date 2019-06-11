const transformMarkup = (markup) => markup.replace(/\s/gm, '');
const html = (container) => container.innerHTML;

export {
	transformMarkup,
	html
}