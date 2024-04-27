const users: { id: number; name: string; }[] = [];

export class UserRepository {
	createUser() {
		const user = {
			id: 1,
			name: "samir",
		};
		users.push(user);
		return user;
	}

      getUsers() {
		return users;
	}
}
