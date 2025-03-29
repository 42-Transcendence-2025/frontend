import {CONFIG} from "../../../config.js";

/** @type {Controller} */
export class RegisterController {
	titleSuffix = "Register";


	#mandatoryFields = [
		`email`,
		`username`,
		`password`,
		`password_confirm`,
	];
	#optionalFields = [
		`otp_code`,
	];

	init() {
		console.log("Register Controller");
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

		$(`#register-form`).on("submit", (e) => {
			e.preventDefault();
			this.#registerSubmit();
		});
	};

	async #registerSubmit(){
		// TODO: add validation
		const formData = {
			email: $(`#email`).val(),
			username: $(`#username`).val(),
			password: $(`#password`).val(),
			password_confirm: $(`#password_confirm`).val(),
			otp_code: $(`#otp_code`).val(),
		};
		await window.tools.authManager.register(formData);

		if (!window.tools.authManager.isLoggedIn()) {
			// TODO: show errors. Either a toast or below each field
			if (window.tools.authManager.authErrors.detail) {
				// TODO: show toast
				console.warn("Register failed:", window.tools.authManager.authErrors.detail);
			} else {
				console.warn("Register failed:", window.tools.authManager.authErrors);
				this.#showErrors(window.tools.authManager.authErrors);
			}
			return;
		}
		window.location.href = `#${CONFIG.routes.home.view}`;
	}
}
