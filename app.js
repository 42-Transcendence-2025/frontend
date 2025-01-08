import { CONFIG } from "./config.js";

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

			const response = await fetch(`${CONFIG.routesViewsPath}/${viewFile}`);
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