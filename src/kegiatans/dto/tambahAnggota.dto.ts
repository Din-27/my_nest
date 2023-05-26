import { IsNotEmpty, IsString } from 'class-validator';

export class TambahAnggotaDto {
    @IsNotEmpty()
    @IsString()
    readonly _id: string;

    @IsNotEmpty()
    @IsString()
    readonly user_invite: string;
}
