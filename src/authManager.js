import {CONFIG} from "../config.js";
import {jwtDecode} from "/libs/jwt-decode-4.0.0/jwt-decode-4.0.0.js";

export class AuthManager {
	static #ACCESS_TOKEN_KEY = "access_token";
	static #REFRESH_TOKEN_KEY = "refresh_token";
	static #POLLING_INTERVAL = 1000 * 60 * 5; // TODO: decrease this if needed
	//-------------------------------------------
	/** @type {string} */
	#userApiUrl;

	/** @type {number | null} */
	#pollingInterval = null;

	//-------------------------------------------
	#id = new Date().getTime();
	/** @type {object | null} */
	#user = null;

	/** @type {string | null} */
	#otpRequiredUsername = null;


	/** @type {{accessToken: string, refreshToken: string} | null} */
	#jwt = null;

	#otpRequired = false;

	#isLoading = false;

	/** @type {{[key:string]: string} | null} */
	#authErrors = null;

	/** @type {object | null} */
	#lastResponse = null;
	//-------------------------------------------

	/**
	 *
	 * @param {string} userApiUrl
	 */
	constructor(userApiUrl) {
		this.#userApiUrl = userApiUrl;

		if (window.tools.authManager) {
			window.tools.authManager.destroy();
		}
		window.tools.authManager = this;
		console.debug(`AuthManager created. #${this.#id}`);

		this.#getJwtFromStorage();
	}

	destroy() {
		this.#jwt = null;
		this.#authErrors = null;
		this.#otpRequired = false;
		this.#isLoading = false;
		console.debug(`AuthManager destroyed. #${this.#id}`);
	}


	isLoggedIn() {
		return !this.isAccessTokenExpired();
	}
	//-----------------------------------------------------------------------------------------------------------------
	// LOCAL STORAGE

	/**
	 * @param {string} access
	 * @param {string} refresh
	 */
	#updateJwt(access, refresh) {
		this.#jwt = {
			access,
			refresh,
		};
		this.#saveJwtToStorage();
	}

	startPollingAccessToken(){
		clearInterval(this.#pollingInterval);
		console.debug(`AuthManager started polling access token every ${AuthManager.#POLLING_INTERVAL} ms`);
		this.#pollingInterval = setInterval(() => {
			this.refreshAccessToken();
		}, AuthManager.#POLLING_INTERVAL);
	}

	#getJwtFromStorage() {
		const access = localStorage.getItem(AuthManager.#ACCESS_TOKEN_KEY);
		const refresh = localStorage.getItem(AuthManager.#REFRESH_TOKEN_KEY);
		if (access && refresh) {
			this.jwt = { access, refresh };
			console.debug(`authManager[getTokensFromStorage]: JWT found in localStorage. ${this.jwt}`);
			return this.jwt;
		}
		console.warn("Missing JWT in localStorage. Login required.");
		this.jwt = {access: null, refresh: null};
		// TODO: redirect to login page from somewhere
		return null;
	}
	#saveJwtToStorage() {
		localStorage.setItem(AuthManager.#ACCESS_TOKEN_KEY, this.jwt?.access ?? "");
		localStorage.setItem(AuthManager.#REFRESH_TOKEN_KEY, this.jwt?.refresh ?? "");
	}
	#clearJwtFromStorage() {
		localStorage.removeItem(AuthManager.#ACCESS_TOKEN_KEY);
		localStorage.removeItem(AuthManager.#REFRESH_TOKEN_KEY);
	}

	//-----------------------------------------------------------------------------------------------------------------


	/**
	 * @typedef LoginFormDTO {{email: string, username: string, password: string, passwordConfirm: string}}
	 */

	/** @param {LoginFormDTO} formData */
	async login(formData) {
		this.#isLoading = true;
		this.#authErrors = {};

		$.ajax({
			url: `${this.#userApiUrl}/login/`,
			method: "POST",
			data: formData,
		})
		.done((response) => {
			this.#lastResponse = response;
			// this.#otpRequired = true;
			this.#otpRequiredUsername = formData.username;
		})
		.fail((error) => {
			console.error('Login failed:', error);
			if (error.response?.data) {
				this.#authErrors = error.response.data;
			}
		})
		.always(() => {
			this.#isLoading = false;
		});
	};

	/** @param {LoginFormDTO} formData */
	async register(formData) {
		this.#isLoading = true;
		this.#authErrors = {};

		$.ajax({
			url: `${this.#userApiUrl}/register/`,
			method: "POST",
			data: formData,
		})
		.done((response) => {
			this.#lastResponse = response;
			this.#otpRequired = true;
			this.#otpRequiredUsername = formData.username;
		})
		.fail((error) => {
			console.error('Registration failed:', error);
			if (error.response?.data) {
				this.#authErrors = error.response.data;
			} else {
				console.error('Registration failed:', error);
			}
		})
		.always(() => {
			this.#isLoading = false;
		});
	};

	/**
	 * @param {string} otpCode
	 */
	async confirmOtp(otpCode) {
		this.#isLoading = true;
		this.#authErrors = {};

		return $.ajax({
			url: `${this.#userApiUrl}/verify-otp/`,
			method: "POST",
			data: {
				username: this.#otpRequiredUsername,
				otp_code: otpCode,
			},
		})
		.done((response) => {
			this.#lastResponse = response;
			this.#updateJwt(response.access, response.refresh);
			this.startPollingAccessToken();

			this.#user = response.user;
			this.#otpRequired = false;
			this.#otpRequiredUsername = null;
			return true;
		})
		.fail((error) => {
			if (error.response?.data) {
				this.#authErrors = error.response.data;
			} else {
				console.error('OTP confirmation failed:', error);
			}
			return false;
		})
		.always(() => {
			this.#isLoading = false;
		});
	};

	logout() {
		this.user = null;
		this.jwt = {
			access: null,
			refresh: null,
		};
		this.otpRequired = false;
		this.userForOtp = null;
		this.#clearJwtFromStorage();
		window.location.href = `#${CONFIG.routes.login.view}`;
	}

	// JWT-related methods
	isAccessTokenExpired() {
		if (!this.jwt?.access) return true;
		try {
			const decoded = jwtDecode(this.jwt.access); // TODO: check if jwtDecode is available
			return decoded.exp * 1000 < Date.now();
		} catch (error) {
			console.error('Failed to decode JWT:', error);
			return true;
		}
	}

	async refreshAccessToken() {
		this.#isLoading = true;
		this.#authErrors = {};

		$.ajax({
			url: `${this.#userApiUrl}/token_refresh/`,
			method: "POST",
			data: {
				refresh: this.#jwt.refresh,
			},
		})
		.done((response) => {
			this.#lastResponse = response;
			this.#updateJwt(response.access, response.refresh);
		})
		.fail((error) => {
			console.error('Token refresh failed:', error);
			this.#clearJwtFromStorage();
			clearInterval(this.#pollingInterval);
			window.location.href = `#${CONFIG.routes.login.view}`;
			// throw error;
		})
		.always(() => {
			this.#isLoading = false;
		});
	}

	// Get user info
	async getUserInfo() {
		this.#isLoading = true;
		$.ajax({
			url: `${this.#userApiUrl}/profile/`,
			method: "GET",
		})
		.done((response) => {
			this.#lastResponse = response;
			this.#user = response.data;
		})
		.fail((error) => {
			console.error('User info retrieval failed:', error);
		})
		.always(() => {
			this.#isLoading = false;
		});
	}

	// GETTERS ---------------------------------------------------------------------------------------------------------

	/** @type {string | null} */
	get accessToken() {
		return this.#jwt?.accessToken?.trim() ?? null;
	}
	get authErrors() {
		return this.#authErrors;
	}
	get isLoading() {
		return this.#isLoading;
	}
	get otpRequired() {
		return this.#otpRequired;
	}
	/** @type {string | null} */
	get refreshToken() {
		return this.#jwt?.refreshToken?.trim() ?? null;
	}
}
