import HomeController from "./src/controllers/homeCtrl.js";
import TestController from "./src/controllers/testCtrl.js";

//-----------------------------------------------------------------------------

// TYPES

/**
 * @typedef {{
 * 	titleSuffix: string,
 * 	init: function,
 * }} Controller
 */

//-----------------------------------------------------------------------------
// GLOBAL VARIABLES

var LOCAL_STORAGE_KEYS = {
	locale: "locale",
};

const LOCALE_URLS = {
	en:"i18n/en.json",
	it:"i18n/it.json",
	uk:"i18n/uk.json",
};
const LOCALE_IMAGES = {
	en: "assets/flags/us.png",
	it: "assets/flags/it.png",
	uk: "assets/flags/ua.png",
}
const LOCALE_SWITCH_ID = "locale-switch";

const APP_BASE_TITLE = "Pong Game";
const APP_CONTAINER_ID = "app";

/**
 *  @type {{[key: string]: Controller }}
 *  Map of routes to controllers. The key is the hash name. The value is the controller class.
 *  @todo: Add routes + controllers here
*/
const ROUTES = {
	"home": HomeController,
	"test": TestController,
}
// Default route if the hash is not found (preferred route).
const DEFAULT_ROUTE = "home";

//-----------------------------------------------------------------------------

(async function () {
	// I18N setup & load
	// $.i18n.debug = true;
	$.i18n().load(LOCALE_URLS);

	function setLocale(locale="en"){
		if (!Object.keys(LOCALE_URLS).includes(locale)) {
			console.error("Unknown locale: " + locale);
			locale = "en";
		}
		$.i18n().locale = locale;
		localStorage.setItem(LOCAL_STORAGE_KEYS.locale, locale);
		$(document.body).i18n();
		const img = $(`#${LOCALE_SWITCH_ID} .selected-flag-img`);
		if (img.attr("src") != LOCALE_IMAGES[locale]){
			img.attr("src", LOCALE_IMAGES[locale]);
		}
		img.removeClass("d-none");
	}
	let savedLocale = localStorage.getItem(LOCAL_STORAGE_KEYS.locale);
	setLocale(savedLocale);

	$(`#${LOCALE_SWITCH_ID} .lang-item`).on("click", (el) => {
		const $el = $(el.currentTarget);
		setLocale($el.data("lang"));
	});

	function stripHash(view) {
		if (!view) return '';
		view = view.startsWith('#') ? view.substring(1) : view;
		view = view.split('?')[0].split('_')[0];
		return view;
	}

	// TODO: add better error handling
	function fetchText(path) {
		return fetch(path)
		.then(res => {
			if (!res.ok) {
				throw new Error(`HTTP error!: ${res}`);
			}
			return res.text();
		})
		.catch(err => {
			alert("An error occurred. Reload the page please: "); console.error(err);
			return null;
		});
	}

	async function loadView(hashName) {
		if (!hashName || !(hashName in ROUTES)) {
			hashName = DEFAULT_ROUTE;
		}

		var viewFile = `/src/views/${hashName}.html`;

		const view = (hashName in ROUTES) ? await fetchText(viewFile) : null;

		if (!view) {
			if (hashName != DEFAULT_ROUTE) {
				window.location.hash = DEFAULT_ROUTE;
			}
			return;
		}

		$(`#${APP_CONTAINER_ID}`).html(view);
		$(document.body).i18n();

		const script = loadScript(hashName);

		if (script) {
			if (script.titleSuffix) {
				document.title = `${APP_BASE_TITLE} - ${script.titleSuffix}`;
			}
			script.init();
		} else {
			document.title = `${APP_BASE_TITLE}`;
			if (!(hashName in ROUTES)) {
				console.warn("No script found for #" + hashName);
			}
		}
	}
	/**
	 * @param {string} hashName
	 * @returns {Controller | null}
	 */
	function loadScript(hashName) {
		if (!hashName || !(hashName in ROUTES)) {
			hashName = DEFAULT_ROUTE;
		}
		if (ROUTES[hashName]) {
			return new ROUTES[hashName]();
		}
		return null;
	}

	window.onhashchange = function () {
		const newHash = window.location.hash;
		const strippedHash = stripHash(newHash);
		loadView(strippedHash);

		// update header `active` link state
		const headerLinks = $(`#header`).find(`a.nav-link`);
		headerLinks.each((idx, element) => {
			const $el = $(element);
			const href = stripHash($el.attr(`href`));

			if (href != strippedHash) {
				$el.removeClass(`active`);
			} else {
				$el.addClass(`active`);
			}
		});
	};

	window.onload = function () {
		document.title = APP_BASE_TITLE;
		$(window).trigger("hashchange");
	};
}());