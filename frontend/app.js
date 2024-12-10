import HomeView from "./scripts/homeCtrl.js";
import TestView from "./scripts/testCtrl.js";

//-----------------------------------------------------------------------------

// TYPES

/**
 * @typedef {{
 * 	titleSuffix: string,
 * 	init: function,
 * }} View
 */

//-----------------------------------------------------------------------------

const APP_BASE_TITLE = "Pong Game";
const APP_CONTAINER_ID = "app";

(function () {

	function stripHash(view) {
		if (!view) return '';
		view = view.startsWith('#') ? view.substring(1) : view;
		view = view.split('?')[0].split('_')[0];
		return view;
	}

	function fetchText(path){
		return fetch(path).then(response => response.text()).catch(err=>{error(err); return null;});
	}

	// TODO: add better error handling
	function error(msg){
		alert("Error: " + msg);
	}

	async function loadView(hashName) {
		if (!hashName) {
			hashName = 'home';
		}
		var viewFile = `/views/${hashName}.html`;

		const view = await fetchText(viewFile);

		if (!view) {
			if (hashName != 'home') {
				loadView('home');
			}
			return;
		}

		$(`#${APP_CONTAINER_ID}`).html(view);

		const script = await loadScript(hashName);
		document.title = `${APP_BASE_TITLE}${script?.titleSuffix ? ` - ${script?.titleSuffix}` : ''}`;
		if (script) {
			script.init();
		} else {
			console.log("No script found for #" + hashName);
		}

	}
	/**
	 * @param {string} hashName
	 * @returns {Promise<View | null>}
	 */
	async function loadScript(hashName) {
		if (!hashName) {
			hashName = 'home';
		}
		switch (hashName){
			case 'home':
				return new HomeView();
			case 'test':
				return new TestView();
			default:
				return null;
		}
	}

	window.onhashchange = function () {
		const newHash = window.location.hash;
		const strippedHash = stripHash(newHash);
		loadView(strippedHash);

		// update header `active` link state
		const headerLinks = $(`#header`).find(`a.nav-link`);
		headerLinks.each((idx, element)=>{
			const $el = $(element);
			const href = stripHash($el.attr(`href`));

			if (href != strippedHash){
				$el.removeClass(`active`);
			} else {
				$el.addClass(`active`)
			}
		})

	};

	window.onload = function () {
		document.title = APP_BASE_TITLE;
		$(window).trigger("hashchange");
	};
}());