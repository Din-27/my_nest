import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    timestamps: true,
})
export class Invite extends Document {
    @Prop()
    id_kegiatan: string;

    @Prop()
    id_kalender: string;

    @Prop()
    eventId: string;

    @Prop()
    id_user: string;

    @Prop()
    owner: string;

    @Prop()
    status: number;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);
