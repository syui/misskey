import * as redis from 'redis';
//import config from '../config';

export default process.env.REDIS_URL ? redis.createClient(
	parseInt(new URL(process.env.REDIS_URL).port),
	new URL(process.env.REDIS_URL).hostname,
	{
		auth_pass: new URL(process.env.REDIS_URL).password,
		prefix: 'queue',
		db: 0
	}
) : null;
