import {CONFIG} from "./config.js";
import {AuthManager} from "./src/authManager.js";
import {HashUtils} from "./src/utils/hashUtils.js";
import {I18nUtils} from "./src/utils/i18nUtils.js";

//-----------------------------------------------------------------------------

(async function () {
	// I18N setup & load
	$.i18n.debug = CONFIG.debug;
	$.i18n().load(CONFIG.locale.configs);


	let savedLocale = localStorage.getItem(CONFIG.localStorageKeys.locale);
	I18nUtils.setLocale(savedLocale);

	$(`#${CONFIG.locale.switchSelectorID} .lang-item`).on("click", (el) => {
		const $el = $(el.currentTarget);
		I18nUtils.setLocale($el.data("lang"));
	});



	async function loadView(hashName) {
		const selectedRoute = CONFIG.routes[hashName];
		const isValidRoute = hashName in CONFIG.routes && selectedRoute;
		if (!isValidRoute) {
			if (hashName == CONFIG.defaultRoute) return;
			console.warn(`Unknown route "${hashName}" - redirecting to "#${CONFIG.defaultRoute}"`);
			window.location.hash = CONFIG.defaultRoute;
			return;
		}
		if (selectedRoute.authRequired && !window.tools.authManager.isLoggedIn()) {
			// TODO: add a message to the user that they need to login
			console.warn(`User is not logged in. Redirecting to "#${CONFIG.routes.login.view}"`);
			window.location.hash = CONFIG.routes.login.view;
			return;
		}

		try {
			let viewFile = selectedRoute.view;
			if (!viewFile.endsWith(".html")) {
				viewFile += ".html";
			}

			const response = await fetch(`${CONFIG.routesViewsPath}/${viewFile}`);
			if (!response.ok) {
				throw new Error(`Failed to fetch view "${hashName}"`);
			}
			const viewHTML = await response.text();
			$(`#${CONFIG.appContainerID}`).html(viewHTML);

			$(document.body).i18n();

			const controller = selectedRoute.controller ? new selectedRoute.controller() : null;
			document.title = CONFIG.baseTitle;
			if (controller) {
				if (controller.titleSuffix) {
					document.title = `${CONFIG.baseTitle} - ${controller.titleSuffix}`;
				}
				controller.init();
			}

		} catch (err) {
			// TODO: add a message to the user that the page failed to load and they should reload the page
			console.warn(`Failed to load route "${hashName}". Error: `, err);
			alert("An error occurred. Reload the page please");
			return;
		}

	}

	window.onhashchange = function () {
		const newHash = window.location.hash;
		const route = HashUtils.stripHash(newHash);
		loadView(route);

		// update header `active` link state
		const headerLinks = $(`#header`).find(`a.nav-link`);
		headerLinks.each((idx, element) => {
			const $el = $(element);
			const href = HashUtils.stripHash($el.attr(`href`));
			$el.toggleClass(`active`, href == route);
		});
	};
	function loadTools(){
		window.tools.authManager = new AuthManager(CONFIG.apiRoutes.userApiUrl);
	}

	window.onload = function () {
		document.title = CONFIG.baseTitle;
		loadTools();

		$(window).trigger("hashchange");
	};
}());
