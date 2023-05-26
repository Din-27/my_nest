import * as moment from 'moment'

export class UtilityKegiatan {
    decodedToken(decoded: { (token: string): string | { [key: string]: any; }; (token: string): string | { [key: string]: any; }; (arg0: any): any; }, req: { header: (arg0: string) => any; }) {
        const authHeader = req.header("Authorization")
        const token = authHeader && authHeader.split(' ')[1]
        const payload = decoded(token)
        return payload;
    }

    handleStatusTime(array: any[]) {
        const data = array.map((item: { tanggal_kegiatan: string | number | Date; jam_mulai: string; jam_selesai: string; _doc: { status: any; background: any; }; }) => {
            let sts: string, bg: string
            const dateData = new Date(item.tanggal_kegiatan).getTime();
            const date = new Date(moment(Date.now()).format('YYYY-MM-DD')).getTime()

            const isAfterDate = date > dateData;
            const isBeforeDate = date < dateData
            const isSameDate = !isAfterDate && !isBeforeDate
            const timeMoment = moment().format('HH:mm').replace(':', '')
            const time_mulai = item.jam_mulai.replace(':', '')
            const time_selesai = item.jam_selesai.replace(':', '')

            const isBeforeTime = parseInt(timeMoment) < parseInt(time_mulai)
            const isAfterTime = parseInt(timeMoment) > parseInt(time_selesai)


            if (isAfterDate || (isSameDate && isAfterTime) || (isAfterDate && isAfterTime)) {
                sts = 'Telah Dilaksanakan'
                bg = '#05f711'
            } else if (isBeforeDate || (isBeforeDate && isBeforeTime) || (isSameDate && isBeforeTime)) {
                sts = 'Belum Dilaksanakan'
                bg = '#7a7777'
            } else {
                sts = 'Sedang Dilaksanakan'
                bg = '#ff1919'
            }
            item._doc.status = sts
            item._doc.background = bg
            return item._doc
        })
        return data
    }
}