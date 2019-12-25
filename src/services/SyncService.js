import {synchronize} from "@nozbe/watermelondb/sync";
import * as Q from "@nozbe/watermelondb/QueryDescription";

const apiUrl = 'http://shopghapi-env.uk8emku5hg.eu-central-1.elasticbeanstalk.com';

export default class SyncService {
	static async sync(company, database, userRole) {
		console.log("ABOUT TO SYNC");
		await synchronize({
			database,
			pullChanges: async ({ lastPulledAt }) => {
				let queryString = '';
				if (company) {
					queryString = `${queryString}&company_id=${company.id}`;
				}

				if (userRole = 'superadmin') {
					queryString = `${queryString}&admin=true`
				}
				const response = await fetch(`${apiUrl}/pull_changes?last_pulled_at=${lastPulledAt}${queryString}`);
				if (!response.ok) {
					throw new Error(await response.text())
				}

				const { changes, timestamp } = await response.json();

				// check if row does not exist and move it from updated to created
				const tables = Object.keys(changes);

				console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
				console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
				console.log(changes);
				console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
				console.log("%%%%%%%%%%%%%%%%%%%%%%%%");

				/*
				for (let m = 0; m < tables.length; m++) {
					const tablename = tables[m];
					const updated = changes[tablename].updated;
					for (let i = 0; i < updated.length; i++) {
						const rowToUpdate = updated[i];
						let existingRow = await database.collections.get(tablename)
							.find(rowToUpdate.id);
						existingRow = existingRow[0];
						if (typeof existingRow === "undefined") {
							// add to created
							changes[tablename].created.push(rowToUpdate);
							// remove from updated
							changes[tablename].updated = changes[tablename].updated.filter(row => row.id !== rowToUpdate.id);
						}
					}
				}

				for (let m = 0; m < tables.length; m++) {
					const tablename = tables[m];
					const created = changes[tablename].created;
					for (let i = 0; i < created.length; i++) {
						const rowToCreate = created[i];
						const existingRow = await database.collections.get(tablename)
							.find(rowToCreate.id)
						if (existingRow) {
							// add to updated
							changes[tablename].updated.push(rowToCreate);
							// remove from created
							changes[tablename].created = changes[tablename].created.filter(row => row.id !== rowToCreate.id);
						}
					}
				}
				*/

				return { changes, timestamp };
			},
			pushChanges: async ({ changes, lastPulledAt }) => {
				let queryString = '';
				if (company) {
					queryString = `${queryString}&company_id=${company.id}`;
				}

				if (userRole = 'superadmin') {
					queryString = `${queryString}&admin=true`
				}
				const response = await fetch(`${apiUrl}/push_changes?last_pulled_at=${lastPulledAt}${queryString}`, {
					method: 'POST',
					body: JSON.stringify(changes),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				if (!response.ok) {
					throw new Error(await response.text())
				}
			},
		})
	}
}
