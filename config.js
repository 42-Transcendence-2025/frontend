import {HomeController} from "./src/routes/controllers/homeCtrl.js";
import {LoginController} from "./src/routes/controllers/loginCtrl.js";
import {LandingPageController} from "./src/routes/controllers/landingPageCtrl.js";
import {CasualGameController} from "./src/routes/controllers/casualGameCtrl.js";
import {RegisterController} from "./src/routes/controllers/registerCtrl.js";
import {PongAIController} from "./src/routes/controllers/pongAICtrl.js";

/**
 * @typedef {Object} Tools
 * @property {AuthManager} authManager
 */

/** 
 * @type {Window & { tools: Tools }}
 * @global
 */
// var window = window;

window.tools = {};

// TYPES

/**
 * @typedef {{
 * 	titleSuffix: string,
 * 	init: function,
 * }} Controller
*/

//------------------------------------------------------------------------------

const BASE_URL = window.location.origin.split(/(http[s]?:\/\/.*):/)[1];



// GLOBAL SETTINGS
/**
 * @type {{
 * 	debug: boolean,
 * 	baseTitle: string,
 * 	appContainerID: string,
 * 	routes: {[key: string]: {view: string, controller: Controller, authRequired?: boolean}},
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

	apiRoutes: {
		userApiUrl: `${BASE_URL}:8003`,
	},

	/**
	 *  Routing map. The key is the hash (without the #) name. The value is an object with the following properties:
	 *  view: view file name (without the .html extension)
	 *  controller: Controller
	 *  @todo: Add routes + controllers here
	*/
	routes: {
		"": {
			view: "landingPage",
			controller: LandingPageController,
		},
		"home": {
			view: "home",
			controller: HomeController,
			authRequired: true,
		},
		casualGame: {
			view: "casualGame",
			controller: CasualGameController,
			authRequired: true,
		},
		login: {
			view: "login",
			controller: LoginController,
		},
		register: {
			view: "register",
			controller: RegisterController,
		},
		pongAI: {
			view: "pongAI", // Nome del file HTML (senza estensione)
			controller: PongAIController, // Controller associato
			authRequired: false, // Imposta su `true` se l'accesso richiede autenticazione
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
window.config = CONFIG;
//-----------------------------------------------------------------------------
