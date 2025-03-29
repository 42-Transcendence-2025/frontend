import {CONFIG} from "../../../config.js";

/** @type {Controller} */
export class LoginController {
	titleSuffix = "Login";

	#mandatoryFields = [
		`username`,
		`password`,
	];
	#optionalFields = [
		`otp_code`,
	];

	init() {
		console.log("Login Controller");
		this.#bindEvents();
	};

	#showErrors(errors) {
		for (const field in errors) {
			const $field = $(`#${field}-help`);
			if ($field.length) {
				$field.removeClass(`d-none`);
				$field.html(errors[field].join(`<br>`));
			}
		}
	}

	#bindEvents() {
		for (const field of this.#mandatoryFields) {
			$(`#${field}`).on("input", () => {
				$(`#${field}-help`).addClass(`d-none`);
			});
		}

		$(`#login-form`).on("submit", (e) => {
			e.preventDefault();
			this.#loginSubmit();
		});
	};

	async #loginSubmit(){
		// TODO: add validation
		const formData = {
			username: $(`#username`).val(),
			password: $(`#password`).val(),
			otp_code: $(`#otp_code`).val(),
		};
		await window.tools.authManager.login(formData);
		if (!window.tools.authManager.isLoggedIn()) {
			// TODO: show errors. Either a toast or below each field
			if (window.tools.authManager.authErrors.detail) {
				// TODO: show toast
				console.warn("Login failed:", window.tools.authManager.authErrors.detail);
			} else {
				console.warn("Login failed:", window.tools.authManager.authErrors);
				this.#showErrors(window.tools.authManager.authErrors);
			}
			return;
		}
		window.location.href = `#${CONFIG.routes.home.view}`;
	}
}
