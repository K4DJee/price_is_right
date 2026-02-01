import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private configService: ConfigService){
        const clientID = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const callbackURL = process.env.GOOGLE_CALLBACK_URL;

        console.log('🔍 === GOOGLE OAUTH CONFIGURATION ===');
        console.log('✅ Client ID exists:', clientID);
        console.log('📋 Client ID (full):', clientID);
        console.log('✅ Client Secret exists:', !!clientSecret);
        console.log('🔗 Callback URL:', callbackURL);
        console.log('📝 Expected callback:', 'http://localhost:3000/auth/google/callback');
        console.log('✅ Callback matches:', callbackURL === 'http://localhost:3000/auth/google/callback');
        super({
            clientID: configService.get<string>('GOOGLE_CLIENT_ID')!,
            clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET')!,
            callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL')!,
            scope: ['email', 'profile'],

        });
    }
    


    async validate(
        accessToken: string,
        refreshToken: string, 
        profile: any,
        done: VerifyCallback
    ):Promise<any>  {
        const {name, emails, photos, id} = profile;
        
        const user = {
            email: emails[0].value,
            nickname: name.givenName,
            picture: photos[0]?.value,
            accessToken,
            refreshToken,
            provider: 'google',
            providerId: id,
        }

        done(null, user)
    }
}