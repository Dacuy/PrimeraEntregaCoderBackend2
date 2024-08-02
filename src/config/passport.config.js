import passport from 'passport';
import local from 'passport-local';
import { usersService } from "../managers/index.js";
import AuthService from "../services/AuthService.js";
import User from "../managers/models/user.model.js";
const LocalStrategy = local.Strategy;
import jwt from 'jsonwebtoken';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const initializePassportConfig = () => {
    passport.use('register', new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, async (req, email, password, done) => {
        const { first_name, last_name, age } = req.body;
        if (!first_name || !last_name || !age) {
            return done(null, false, { message: 'Incomplete Values' });
        }
        const user = await usersService.getUserByEmail(email);
        if (user) {
            return done(null, false, { message: 'User already exists' });
        } else {
            const authService = new AuthService();
            const hashedPassword = authService.hashPassword(password);
            const newUser = {
                first_name,
                last_name,
                age,
                email,
                password: hashedPassword
            };
            try {
                const result = await usersService.createUser(newUser);
                return done(null, result);
            } catch (error) {
                return done(error);
            }
        }
    }));

    passport.use('login', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        const user = await usersService.getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'User not found' });
        }
        const authService = new AuthService();
        const isMatch = authService.comparePassword(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid credentials' });
        }
        const token = authService.signToken({ id: user._id });
        return done(null, { user, token });
    }));

    passport.use('current', new JwtStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([(req) => req.cookies.jwt]),
        secretOrKey: 'secretito'
    }, async (jwtPayload, done) => {
        try {
            const user = await usersService.getUserById(jwtPayload.id).select('-password');
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }
            return done(null, user);
        } catch (err) {
            return done(err, false);
        }
    }));
};

export default initializePassportConfig;
