import $ from 'cafy';
import ID, { transform } from '../../../../misc/cafy-id';
import User from '../../../../models/user';
import Following from '../../../../models/following';
import { pack } from '../../../../models/user';
import { getFriendIds } from '../../common/get-friends';
import define from '../../define';
import { ApiError } from '../../error';

export const meta = {
	desc: {
		'ja-JP': '指定したユーザーのフォロワー一覧を取得します。',
		'en-US': 'Get followers of a user.'
	},

	tags: ['users'],

	requireCredential: false,

	params: {
		userId: {
			validator: $.optional.type(ID),
			transform: transform,
			desc: {
				'ja-JP': '対象のユーザーのID',
				'en-US': 'Target user ID'
			}
		},

		username: {
			validator: $.optional.str
		},

		host: {
			validator: $.optional.nullable.str
		},

		limit: {
			validator: $.optional.num.range(1, 100),
			default: 10
		},

		cursor: {
			validator: $.optional.type(ID),
			default: null as any,
			transform: transform,
		},

		iknow: {
			validator: $.optional.bool,
			default: false,
		}
	},

	res: {
		type: 'object',
		properties: {
			users: {
				type: 'array',
				items: {
					type: 'User',
				}
			},
			next: {
				type: 'string',
				format: 'id',
				nullable: true
			}
		}
	},

	errors: {
		noSuchUser: {
			message: 'No such user.',
			code: 'NO_SUCH_USER',
			id: '27fa5435-88ab-43de-9360-387de88727cd'
		}
	}
};

export default define(meta, async (ps, me) => {
	const q: any = ps.userId != null
		? { _id: ps.userId }
		: { usernameLower: ps.username.toLowerCase(), host: ps.host };

	const user = await User.findOne(q);

	if (user === null) {
		throw new ApiError(meta.errors.noSuchUser);
	}

	const query = {
		followeeId: user._id
	} as any;

	// ログインしていてかつ iknow フラグがあるとき
	if (me && ps.iknow) {
		// Get my friends
		const myFriends = await getFriendIds(me._id);

		query.followerId = {
			$in: myFriends
		};
	}

	// カーソルが指定されている場合
	if (ps.cursor) {
		query._id = {
			$lt: ps.cursor
		};
	}

	// Get followers
	const following = await Following
		.find(query, {
			limit: ps.limit + 1,
			sort: { _id: -1 }
		});

	// 「次のページ」があるかどうか
	const inStock = following.length === ps.limit + 1;
	if (inStock) {
		following.pop();
	}

	const users = await Promise.all(following.map(f => pack(f.followerId, me, { detail: true })));

	return {
		users: users,
		next: inStock ? following[following.length - 1]._id : null,
	};
});
