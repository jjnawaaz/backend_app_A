import { IUser } from '../../models/user.model';
import { IAdmin } from '../../models/admin.model';

declare module 'express' {
        interface Request {
            user?: object;
            admin?: object;
        }
    }
