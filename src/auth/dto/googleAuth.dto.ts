import { IsBoolean, IsString } from 'class-validator';

export class GoogleAuthDto {
    @IsString()
    readonly token: string;

    @IsString()
    readonly fullname: string;

    @IsString()
    readonly email: string;

    @IsBoolean()
    readonly email_verification: boolean;

    @IsString()
    readonly password: string;
}
