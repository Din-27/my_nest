import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-facebook';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
    constructor() {
        super({
            clientID: process.env.APP_ID,
            clientSecret: process.env.APP_SECRET,
            callbackURL: 'http://localhost:8000/api/v1/facebook-redirect',
            scope: 'email',
            profileFields: ['emails', 'name'],
        })
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (err: any, user: any, info?: any) => void,
    ): Promise<any> {
        const { name, emails } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            fullname: `${name.givenName} ${name?.middleName ? `${name.middleName} ${name.familyName}` : name.familyName}`
        };
        const payload = {
            user,
            accessToken,
        };
        console.log(payload);

        done(null, payload);
    }
}