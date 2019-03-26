import { EntityRepository, Repository } from 'typeorm';
import { Signin } from '../entities/signin';

@EntityRepository(Signin)
export class SigninRepository extends Repository<Signin> {
	public async pack(
		record: any,
	) {
		return record;
	}
}
