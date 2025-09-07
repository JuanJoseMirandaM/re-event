import {UserRole} from '../core/services/user.service';

export interface NavItems {
  label: string;
  link: string;
  icon: string;
  roleAllowed: UserRole[];
}
