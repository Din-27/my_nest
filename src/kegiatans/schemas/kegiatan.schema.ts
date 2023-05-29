import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
})
export class Kegiatan extends Document {

    @Prop()
    id_kegiatan: string;

    @Prop()
    id_kalender: string;

    @Prop()
    eventId: string;

    @Prop()
    nama_kegiatan: string;

    @Prop()
    tanggal_kegiatan: string;

    @Prop()
    jam_mulai: string;

    @Prop()
    jam_selesai: string;

    @Prop()
    owner: string;
}

export const KegiatanSchema = SchemaFactory.createForClass(Kegiatan);
