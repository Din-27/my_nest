import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateKegiatanDto {
    @IsNotEmpty()
    @IsString()
    readonly _id: string;

    @IsNotEmpty()
    @IsString()
    readonly nama_kegiatan: string;

    @IsNotEmpty()
    @IsString()
    readonly tanggal_kegiatan: string;

    @IsNotEmpty()
    @IsString()
    readonly jam_mulai: string;

    @IsNotEmpty()
    @IsString()
    readonly jam_selesai: string;
}