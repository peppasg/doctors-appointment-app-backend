import User, {IUser} from '../models/user.model';

export const findAll = async():Promise<IUser[]> => {
    return await User.find().populate('roles').lean().exec();
}

export const findByEmail = async(email: string): Promise<IUser | null> => {
    return await User.findOne({email: email}).populate('roles').lean().exec();
}

export const createUser = async (data: Partial<IUser>): Promise<IUser> => {
    const user = new User(data);
    return await user.save();
}

export const updateUser = async(username: string, payload: Partial<IUser>):Promise<IUser | null> =>{
  return await User.findOneAndUpdate({username: username}, payload, { returnDocument: 'after' }).populate('roles').lean().exec()
}