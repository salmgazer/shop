export default class MyLocal {

	static get keys () {
		return {
			companyCode: 'company_code',
			userId: 'user_id',
			companyName: 'companyName',
			companyId: 'companyId',
			userRole: 'user_role'
		};
	}
	static get companyCode () {
		return localStorage.getItem(this.keys.companyCode);
	}

	static get userId() {
		return localStorage.getItem(this.keys.userId);
	}

	static get companyName() {
		return localStorage.getItem(this.keys.companyName);
	}

	static get companyId() {
		return localStorage.getItem(this.keys.companyId);
	}

	static get userRole() {
		return localStorage.getItem(this.keys.userRole);
	}

	static setUserId(userId) {
		localStorage.setItem(this.keys.userId, userId);
	}

	static setCompanyCode(companyCode) {
		localStorage.setItem(this.keys.companyCode, companyCode);
	}

	static setCompanyName(companyName) {
		localStorage.setItem(this.keys.companyName, companyName);
	}

	static setCompanyId(companyId) {
		localStorage.setItem(this.keys.companyId, companyId);
	}

	static setUserRole(role) {
		localStorage.setItem(this.keys.userRole, role);
	}

	static setSession(user, company, userCompany) {
		this.setCompanyId(company.id);
		this.setCompanyName(company.name);
		this.setCompanyCode(company.code);
		this.setUserId(user.id);
		this.setUserRole(userCompany.role)
	}

	static sessionExists() {
		return this.userId !== null &&
			this.companyId !== null &&
			this.companyCode !== null &&
			this.companyName !== null &&
			this.userRole !== null;
	}

	static logout() {
		localStorage.removeItem(this.keys.companyId);
		localStorage.removeItem(this.keys.companyCode);
		localStorage.removeItem(this.keys.companyName);
		localStorage.removeItem(this.keys.userId);
		localStorage.removeItem(this.keys.userRole)
		window.location.href = '/';
	}
}
