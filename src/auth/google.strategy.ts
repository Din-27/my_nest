import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.SERVER}api/v1/google-redirect`,
            scope: [
                'email',
                'profile',
                'https://www.googleapis.com/auth/calendar'
            ],
        });
    }


    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback,
    ): Promise<any> {
        const { name, emails, photos } = profile;
        const user = {
            email: emails[0].value,
            firstName: name.givenName,
            lastName: name.familyName,
            fullname: name.givenName + ' ' + name.familyName,
            picture: photos[0].value,
            password: emails[0].value.split('@')[0],
            accessToken,
            refreshToken,
        };

        done(null, user);
    }
}