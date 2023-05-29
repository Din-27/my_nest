import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { AddKegiatanDto } from './dto/addKegiatan.dto';
import { TambahAnggotaDto } from './dto/tambahAnggota.dto';
import { UpdateKegiatanDto } from './dto/updateKegiatan.dto';
import { Invite } from './schemas/invites.schema';
import { Kegiatan } from './schemas/kegiatan.schema';
import { UtilityKegiatan } from './utility/kegiatan.utility';
import axios from 'axios';
import { nanoid } from 'nanoid';

@Injectable()
export class KegiatansService extends UtilityKegiatan {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    @InjectModel(Invite.name)
    private inviteModel: Model<Invite>,
    @InjectModel(Kegiatan.name)
    private kegiatanModel: Model<Kegiatan>,
    private jwtService: JwtService
  ) {
    super()
  }

  async tambahKegiatan(req: any, AddKegiatanDto: AddKegiatanDto) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      const { nama_kegiatan, tanggal_kegiatan, jam_mulai, jam_selesai } = AddKegiatanDto

      if (nama_kegiatan === '' || tanggal_kegiatan === '' || jam_mulai === '' || jam_selesai === '') {
        return {
          status: 401,
          message: 'data kegiatan harus diisi lengkap !'
        }
      }
      const checkKegiatan = await this.kegiatanModel.findOne({
        $and: [
          { id_user: id_user },
          { nama_kegiatan: nama_kegiatan },
        ],
      });

      if (checkKegiatan !== null) {
        const check = checkKegiatan.nama_kegiatan === nama_kegiatan
        if (check) {
          return {
            status: 401,
            message: 'nama kegiatan sudah ada !'
          }
        }
      }

      await this.kegiatanModel.create({
        id_kegiatan: nanoid(10),
        id_kalender: '',
        eventId: '',
        nama_kegiatan: nama_kegiatan,
        tanggal_kegiatan: tanggal_kegiatan,
        jam_mulai: jam_mulai,
        jam_selesai: jam_selesai,
        owner: id_user,
      })

      return {
        status: 200,
        data: 'Sukses menambah kegiatan'
      }
    } catch (error) {
      console.log(error);
      return error.message
    }
  }

  async kegiatanMilikSaya(req: any) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      const getKegiatanByUser = await this.kegiatanModel.find({
        owner: id_user
      })
      return {
        status: 200,
        data: this.handleStatusTime(getKegiatanByUser)
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async kegiatanYgSayaIkuti(req: any) {
    try {
      const result = []
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      const getKegiatanByUser = await this.inviteModel.find({
        $and: [
          { id_user: id_user },
          { status: 1 }
        ]
      })
      for (let i = 0; i < getKegiatanByUser.length; i++) {
        const getKegiatan = await this.kegiatanModel.find({
          id_kegiatan: getKegiatanByUser[i].id_kegiatan
        })
        result.push(getKegiatan[0])
      }

      return {
        status: 200,
        data: this.handleStatusTime(result)
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async getDetailKegiatanMilikSaya(req: { header: (arg0: string) => any; }, id_kegiatan: string) {
    try {
      let result
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      console.log(id_kegiatan);

      const getKegiatanByUser = await this.kegiatanModel.find({
        id_kegiatan: id_kegiatan
      })
      const getUser = await this.inviteModel.find({
        $and: [
          { owner: id_user },
          { id_kegiatan: id_kegiatan },
          { status: 1 }
        ]
      })

      const getOwner = await this.userModel.findOne({
        id_user: id_user
      }, { fullname: 1, _id: 0 })
      if (getUser.length > 0) {
        const getName = await this.userModel.find({
          id_user: getUser[0].id_user
        }, { fullname: 1, _id: 0 })
        result = getName
      }
      console.log(getKegiatanByUser);

      const data = this.handleStatusTime(getKegiatanByUser)[0]
      return {
        status: 200,
        data: {
          ...data,
          id_user: getUser[0]?.id_user,
          anggota: result,
          nama_owner: getOwner?.fullname
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async getDetailKegiatanYgSayaIkuti(req: { header: (arg0: string) => any; }, id_kegiatan: string) {
    try {
      let result
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)

      const getKegiatanByUser = await this.kegiatanModel.find({
        id_kegiatan: id_kegiatan
      })
      const getUser = await this.inviteModel.find({
        $and: [
          { id_user: id_user },
          { id_kegiatan: id_kegiatan },
          { status: 1 }
        ]
      })

      const getOwner = await this.userModel.findOne({
        id_user: getUser[0].owner
      }, { fullname: 1, _id: 0 })
      if (getUser.length > 0) {
        const getName = await this.userModel.find({
          id_user: getUser[0].id_user
        }, { fullname: 1, _id: 0 })
        result = getName
      }

      const data = this.handleStatusTime(getKegiatanByUser)[0]
      return {
        status: 200,
        data: {
          ...data,
          id_user: getUser[0]?.id_user,
          anggota: result,
          nama_owner: getOwner?.fullname
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async deleteKegiatanMilikSaya(req: { header: (arg0: string) => any; }, id_kegiatan: string) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      await this.kegiatanModel.deleteOne({
        $and: [
          { id_kegiatan: id_kegiatan },
          { owner: id_user }
        ]
      })
      await this.inviteModel.deleteMany({
        $and: [
          { id_kegiatan: id_kegiatan },
          { owner: id_user }
        ]
      })
      return {
        status: 200,
        message: 'kegiatan berhasil dihapus !'
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async updateKegiatanMilikSaya(UpdateKegiatanDto: UpdateKegiatanDto) {
    try {
      const { _id, nama_kegiatan, tanggal_kegiatan, jam_mulai, jam_selesai } = UpdateKegiatanDto

      await this.kegiatanModel.findByIdAndUpdate(_id, {
        nama_kegiatan,
        tanggal_kegiatan,
        jam_mulai,
        jam_selesai
      })
      return {
        status: 200,
        message: 'kegiatan berhasil di edit !'
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async tambahAnggotaSaya(req: { header: (arg0: string) => any; }, TambahAnggotaDto: TambahAnggotaDto) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      const { id_kegiatan, user_invite } = TambahAnggotaDto
      const getAnggota = await this.userModel.find({
        fullname: user_invite
      })

      if (getAnggota.length === 0) {
        return {
          status: 401,
          message: 'anggota tidak ditemukan !'
        }
      }

      const getAnggotaWithKegiatan = await this.kegiatanModel.find({ id_kegiatan })
      const checkInvite = await this.inviteModel.find({
        $and: [
          { id_user: getAnggota[0].id_user },
          { id_kegiatan: getAnggotaWithKegiatan[0]?.id_kegiatan }
        ]
      })

      if (checkInvite.length !== 0 && getAnggotaWithKegiatan.length !== 0) {
        if (checkInvite[0].status !== 0) {
          return {
            status: 201,
            message: 'anggota sudah ada di kegiatan ini!'
          }
        } else {
          return {
            status: 201,
            message: `invite sudah terkirim kepada ${user_invite} !`
          }
        }
      }
      await this.inviteModel.create({
        id_kegiatan: getAnggotaWithKegiatan[0].id_kegiatan,
        id_user: getAnggota[0].id_user,
        id_kalender: '',
        eventId: '',
        owner: id_user,
        status: 0
      })
      return {
        status: 200,
        message: 'anggota berhasil di tambahkan '
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async deleteAnggota(req, id_user) {
    try {
      const owner = this.decodedToken((token: string) => this.jwtService.decode(token), req).id_user
      await this.inviteModel.deleteOne({
        $and: [
          { id_user: id_user },
          { owner: owner },
          { status: 1 }
        ]
      })
      return {
        status: 200,
        message: 'Anggota berhasil di hapus'
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async getInvitations(req: { header: (arg0: string) => any; }) {
    try {
      const result = []
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      const getKegiatanByUser = await this.inviteModel.find({
        $and: [
          { id_user: id_user },
          { status: 0 }
        ]
      })

      if (getKegiatanByUser.length !== 0) {
        const item = getKegiatanByUser
        for (let i = 0; i < getKegiatanByUser.length; i++) {
          const getKegiatan = await this.kegiatanModel.find({
            id_kegiatan: item[i].id_kegiatan
          })
          const getNamaOwner = await this.userModel.find({
            id_user: item[i].owner
          })

          result.push({
            _id: item[i]._id,
            nama_kegiatan: getKegiatan.map(x => x.nama_kegiatan)[0],
            owner: getNamaOwner.map(x => x.fullname)[0]
          })

        }
      }

      return {
        status: 200,
        data: {
          jml_notif: getKegiatanByUser.length,
          data_anggota: result
        }
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async acceptInvitation(_id: string) {
    try {

      await this.inviteModel.findByIdAndUpdate(_id, {
        status: 1
      })
      return {
        status: 200,
        message: 'kegiatan berhasil di edit !'
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async refuseInvitation(req: { header: (arg0: string) => any; }) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      await this.inviteModel.deleteOne({
        $and: [
          { id_user: id_user },
          { status: 0 }
        ]
      })
      return { status: 200, message: 'kegiatan berhasil di edit !' }
    } catch (error) {
      console.log(error)
      return {
        status: 200,
        message: error.message,
      };
    }
  }

  async deleteKegiatanYgSayaIkuti(req: { header: (arg0: string) => any; }, id_kegiatan: string) {
    try {
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      await this.inviteModel.deleteOne({
        $and: [
          { id_kegiatan: id_kegiatan },
          { id_user },
          { status: 1 }
        ]
      })
      return {
        status: 200,
        message: 'nama sudah di remove !'
      }
    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  async addToGoogleCalender(body: { _id: string, event: any, access: string }, req) {
    try {
      const { _id, event, access } = body
      const { id_user } = this.decodedToken((token: string) => this.jwtService.decode(token), req)
      console.log(id_user);

      const checkUser = await this.kegiatanModel.findById(_id)
      const checkUserAnggota = await this.inviteModel.find({
        $and: [
          { id_kegiatan: checkUser.id_kegiatan },
          { id_user: id_user }
        ]
      })
      console.log(checkUserAnggota);

      if (checkUser.owner !== id_user && checkUserAnggota[0].id_kalender === '') {
        const responses = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', event,
          {
            headers: {
              'Authorization': 'Bearer ' + access
            }
          })
        await this.inviteModel.findByIdAndUpdate(checkUserAnggota[0]._id, {
          id_kalender: responses.data.id,
          eventId: responses.data.htmlLink.split('eid=')[1]
        })
        return {
          status: 200,
          message: 'Data berhasil ditambah pada google calender'
        }
      } else if (checkUser.owner === id_user && checkUser.id_kalender === '') {
        const responses = await axios.post('https://www.googleapis.com/calendar/v3/calendars/primary/events', event,
          {
            headers: {
              'Authorization': 'Bearer ' + access
            }
          })
        await this.kegiatanModel.findByIdAndUpdate(_id, {
          id_kalender: responses.data.id,
          eventId: responses.data.htmlLink.split('eid=')[1]
        })
        return {
          status: 200,
          message: 'Data berhasil ditambah pada google calender'
        }
      } else {
        return {
          status: 301,
          message: 'Event telah ada pada google calender !'
        }
      }



    } catch (error) {
      console.log(error)
      return {
        status: 500,
        message: error.message,
      };
    }
  }
}
