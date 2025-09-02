import {User, UserRole} from '../../services/user.service';

export interface UserState {
  userProfile: User;
  isAdmin: boolean;
}

export const userInitialState: UserState = {
  isAdmin: false,
  userProfile: {
    userId: '',
    email: '',
    name: '',
    company: '',
    phoneNumber: '',
    avatar: '',
    role: UserRole.GUEST,
    points: 0,
    verified: false,
    createdAt: '',
    updatedAt: '',
  }
}
