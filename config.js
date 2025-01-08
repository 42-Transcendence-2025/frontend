import HomeController from "./src/routes/controllers/homeCtrl.js";

// TYPES

/**
 * @typedef {{
 * 	titleSuffix: string,
 * 	init: function,
 * }} Controller
*/

//------------------------------------------------------------------------------

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
export const CONFIG = {
	routesViewsPath: "src/routes/views",
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
