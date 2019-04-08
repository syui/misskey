//import config from '../config';

const uri = process.env.MONGODB_URI;

/**
 * monk
 */
import mongo from 'monk';

const db = mongo(uri);

export default db;

/**
 * MongoDB native module (officialy)
 */
import * as mongodb from 'mongodb';

let mdb: mongodb.Db;

const nativeDbConn = async (): Promise<mongodb.Db> => {
	if (mdb) return mdb;

	const db = await ((): Promise<mongodb.Db> => new Promise((resolve, reject) => {
		mongodb.MongoClient.connect(uri, { useNewUrlParser: true }, (e: Error, client: any) => {
			if (e) return reject(e);
			resolve(client.db(new URL(process.env.MONGODB_URI).pathname.slice(1)));
		});
	}))();

	mdb = db;

	return db;
};

export { nativeDbConn };
