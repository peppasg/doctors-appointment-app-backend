import User from '../models/user.model';
import Role from '../models/role.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';
const JWT_EXPIRES = '1h';

const memoryUsers: Array<{
    username: string;
    email?: string;
    password: string;
    firstname?: string;
    lastname?: string;
    address?: any;
    phone?: any[];
    roles: Array<{ role: string; active: boolean }>;
}> = [];

const isMongoConfigured = () => Boolean(process.env.MONGO_URI?.trim());

export const signup = async (payload: any) => {
    const username = String(payload.username || '').trim();
    const password = String(payload.password || '');

    if (!username || password.length < 5) {
        return null;
    }

    if (!isMongoConfigured()) {
        if (memoryUsers.some((user) => user.username === username || user.email === payload.email)) {
            return null;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            username,
            email: payload.email,
            firstname: payload.firstname,
            lastname: payload.lastname,
            address: payload.address,
            phone: payload.phone,
            password: hashedPassword,
            roles: [{ role: 'PATIENT', active: true }],
        };

        memoryUsers.push(user);

        const token = jwt.sign(
            { username: user.username, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return { user, token, role: 'patient' };
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email: payload.email }] }).lean().exec();
    if (existingUser) {
        return null;
    }

    let patientRole = await Role.findOne({ role: 'PATIENT' }).exec();
    if (!patientRole) {
        patientRole = await Role.create({ role: 'PATIENT', description: 'Default patient role', active: true });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        username,
        password: hashedPassword,
        email: payload.email,
        firstname: payload.firstname,
        lastname: payload.lastname,
        address: payload.address,
        phone: payload.phone,
        roles: [patientRole._id],
    });

    const token = jwt.sign(
        { username: user.username, email: user.email, roles: user.roles },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    return { user, token, role: 'patient' };
};

export const login = async (username: string, password: string) => {
    const normalizedUsername = String(username || '').trim();

    if (!isMongoConfigured()) {
        const user = memoryUsers.find(
            (entry) => entry.username.toLowerCase() === normalizedUsername.toLowerCase() || entry.email?.toLowerCase() === normalizedUsername.toLowerCase()
        );

        if (!user) return null;

        const match = await bcrypt.compare(password, user.password);
        if (!match) return null;

        const token = jwt.sign(
            { username: user.username, email: user.email, roles: user.roles },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        return { user, token, role: 'patient' };
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${normalizedUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).populate('roles');
    if (!user) return null;

    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;

    const token = jwt.sign(
        { username: user.username, email: user.email, roles: user.roles },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    return { user, token, role: 'patient' };
};

