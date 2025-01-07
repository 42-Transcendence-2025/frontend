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
// GLOBAL SETTINGS
/**
 * @type {{
 * 	debug: boolean,
 * 	baseTitle: string,
 * 	appContainerID: string,
 * 	routes: {[key: string]: {view: string, controller: Controller}},
 * 	defaultRoute: string,
 * 	locale: {
 * 		switchSelectorID: string,
 * 		configs: {[key: string]: string},
 * 		images: {[key: string]: string},
 * 	},
 * 	localStorageKeys: {[key: string]: string},
 * }}
*/
const CONFIG = {
	debug: false,
	baseTitle: "Pong Game",
	appContainerID: "app",

	/**
	 *  Routing map. The key is the hash (without the #) name. The value is an object with the following properties:
	 *  view: view file name (without the .html extension)
	 *  controller: Controller
	 *  @todo: Add routes + controllers here
	*/
	routes: {
		"": {
			view: "home",
			controller: HomeController,
		},
		"test": {
			view: "test",
			controller: TestController,
		},
		"singlePlayer": {
			view: "singlePlayer",
			controller: null,
		},
		"multiPlayer": {
			view: "multiPlayer",
			controller: null,
		},
	},
	// Default route if the hash is not found.
	defaultRoute: "",

	locale: {
		switchSelectorID: "locale-switch",
		configs: {
			en: "i18n/en.json",
			it: "i18n/it.json",
			uk: "i18n/uk.json",
		},
		images: {
			en: "assets/flags/us.png",
			it: "assets/flags/it.png",
			uk: "assets/flags/ua.png",
		}
	},

	localStorageKeys: {
		locale: "locale",
	},
};

//-----------------------------------------------------------------------------

(async function () {
	// I18N setup & load
	$.i18n.debug = CONFIG.debug;
	$.i18n().load(CONFIG.locale.configs);

	function setLocale(locale = "en") {
		if (!Object.keys(CONFIG.locale.configs).includes(locale)) {
			console.error("Unknown locale: " + locale);
			locale = "en";
		}
		$.i18n().locale = locale;
		localStorage.setItem(CONFIG.localStorageKeys.locale, locale);
		$(document.body).i18n();
		const img = $(`#${CONFIG.locale.switchSelectorID} .selected-flag-img`);
		if (img.attr("src") != CONFIG.locale.images[locale]) {
			img.attr("src", CONFIG.locale.images[locale]);
		}
		img.removeClass("d-none");
	}
	let savedLocale = localStorage.getItem(CONFIG.localStorageKeys.locale);
	setLocale(savedLocale);

	$(`#${CONFIG.locale.switchSelectorID} .lang-item`).on("click", (el) => {
		const $el = $(el.currentTarget);
		setLocale($el.data("lang"));
	});

	function stripHash(view) {
		if (!view) return '';
		view = view.startsWith('#') ? view.substring(1) : view;
		view = view.split('?')[0].split('_')[0];
		return view;
	}


	async function loadView(hashName) {
		const selectedRoute = CONFIG.routes[hashName];
		const isValidRoute = hashName in CONFIG.routes && selectedRoute;
		if (!isValidRoute) {
			if (hashName == CONFIG.defaultRoute) return;
			console.warn(`Unknown route "${hashName}" - redirecting to "#${CONFIG.defaultRoute}"`);
			window.location.hash = CONFIG.defaultRoute;
			return;
		}

		try {
			let viewFile = selectedRoute.view;
			if (!viewFile.endsWith(".html")){
				viewFile += ".html";
			}

			const response = await fetch(`/src/views/${viewFile}`);
			if (!response.ok){
				throw new Error(`Failed to fetch view "${hashName}"`);
			}
			const viewHTML = await response.text();
			$(`#${CONFIG.appContainerID}`).html(viewHTML);

			$(document.body).i18n();

			const controller = selectedRoute.controller ? new selectedRoute.controller() : null;
			document.title = CONFIG.baseTitle;
			if (controller){
				if (controller.titleSuffix) {
					document.title = `${CONFIG.baseTitle} - ${controller.titleSuffix}`;
				}
				controller.init();
			}

		} catch (err) {
			// TODO: add better error handling
			console.warn(`Failed to load route "${hashName}". Error: `, err);
			alert("An error occurred. Reload the page please");
			return;
		}

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
		document.title = CONFIG.baseTitle;
		$(window).trigger("hashchange");
	};
}());