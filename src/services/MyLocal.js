export default class MyLocal {

	static get keys () {
		return {
			companyCode: 'company_code',
			userId: 'user_id',
			companyName: 'companyName',
			companyId: 'companyId'
		};
	}
	static get companyCode () {
		return localStorage.getItem('company_code');
	}

	static get userId() {
		return localStorage.getItem('user_id');
	}

	static get companyName() {
		return localStorage.getItem('company_name');
	}

	static get companyId() {
		return localStorage.getItem('company_id');
	}

	static setUserId(userId) {
		localStorage.setItem('user_id', userId);
	}

	static setCompanyCode(companyCode) {
		localStorage.setItem('company_code', companyCode);
	}

	static setCompanyName(companyName) {
		localStorage.setItem('company_name', companyName);
	}

	static setCompanyId(companyId) {
		localStorage.setItem('company_id', companyId);
	}

	static setSession(user, company) {
		this.setCompanyId(company.id);
		this.setCompanyName(company.name);
		this.setCompanyCode(company.code);
		this.setUserId(user.id);
	}

	static sessionExists() {
		return this.userId !== null &&
			this.companyId !== null &&
			this.companyCode !== null &&
			this.companyName !== null;
	}

	static logout() {
		localStorage.removeItem(this.keys.companyId);
		localStorage.removeItem(this.keys.companyCode);
		localStorage.removeItem(this.keys.companyName);
		localStorage.removeItem(this.keys.userId);
		window.location.href = '/';
	}
}
