import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    hashPassword(password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    }

    comparePassword(password, hashedPassword) {
        return bcrypt.compareSync(password, hashedPassword);
    }

    signToken(payload) {
        return jwt.sign(payload, 'secretito', { expiresIn: '1h' });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, 'secretito');
        } catch (err) {
            return null;
        }
    }
}

export default AuthService;
