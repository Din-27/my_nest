import { IsNotEmpty, IsString } from 'class-validator';

export class TambahAnggotaDto {
    @IsNotEmpty()
    @IsString()
    readonly id_kegiatan: string;

    @IsNotEmpty()
    @IsString()
    readonly user_invite: string;
}
