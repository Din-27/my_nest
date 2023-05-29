import { HttpStatus, Injectable, Req, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { GoogleAuthDto } from './dto/googleAuth.dto';
import { google, Auth } from 'googleapis';
import { ForgotDto } from './dto/forgot.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {
  oAuth2Client: any
  passport: any
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService
  ) {
    const clientID = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    this.oAuth2Client = new google.auth.OAuth2(
      clientID,
      clientSecret
    );
  }

  async register(RegisterDto: RegisterDto) {
    const { password, fullname, email, kode_unik } = RegisterDto;
    try {
      const check_user = await this.userModel.findOne({
        $or: [
          { email: email },
          { fullname: fullname }
        ]
      })
      if (check_user !== null) {
        return {
          status: 401,
          message: 'email/username/phone sudah terdaftar !'
        }
      }
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)
      await this.userModel.create({
        id_user: nanoid(10),
        email: email,
        fullname: fullname,
        password: hashedPassword,
        kode_unik: kode_unik
      })

      return {
        status: 200,
        data: 'sukses register'
      }
    } catch (error) {
      console.log(error);
      return error.message
    }
  }

  async login(loginDto: LoginDto) {

    const { email, password } = loginDto
    try {
      const userLogin = await this.userModel.findOne({ email: email })
      if (userLogin === null) {
        return {
          status: 201,
          message: 'user tidak di temukan ! Silahkan daftar terlebih dahulu'
        }
      }
      const isValid = await bcrypt.compare(password, userLogin.password)
      if (!isValid) {
        return {
          status: 400,
          message: 'email and password not match'
        }
      }

      const tokenJwt = this.jwtService.sign({ id_user: userLogin.id_user })

      return {
        status: 200,
        data: {
          fullname: userLogin.fullname,
          email: userLogin.email,
          tokenJwt
        }
      }
    } catch (error) {
      console.log(error);
      return error.message
    }
  }

  async loginGoogle(googleAuthDto: GoogleAuthDto) {

    const { email, email_verification, password, fullname, token } = googleAuthDto
    try {

      if (email_verification === false) {
        return {
          status: 401,
          message: 'email belum terverifikasi !'
        }
      }

      const userLogin = await this.userModel.findOne({ email: email })
      if (userLogin === null) {
        const check_user = await this.userModel.findOne({
          $or: [
            { email: email },
            { fullname: fullname }
          ]
        })
        if (check_user !== null) {
          return {
            status: 401,
            message: 'email/username/phone sudah terdaftar !'
          }
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        this.userModel.create({
          id_user: nanoid(10),
          email: email,
          fullname: fullname,
          password: hashedPassword,
        })
        const isValid = await bcrypt.compare(password, userLogin.password)
        if (!isValid) {
          return {
            status: 400,
            message: 'email and password not match'
          }
        }

        const tokenJwt = this.jwtService.sign({ id_user: userLogin.id_user })
        return {
          status: 200,
          data: {
            fullname: userLogin.fullname,
            email: userLogin.email,
            tokenGoogle: token,
            tokenJwt,
          }
        }
      }

      const isValid = await bcrypt.compare(password, userLogin.password)
      if (!isValid) {
        return {
          status: 400,
          message: 'email and password not match'
        }
      }

      const tokenJwt = this.jwtService.sign({ id_user: userLogin.id_user })
      return {
        status: 200,
        data: {
          fullname: userLogin.fullname,
          email: userLogin.email,
          tokenGoogle: token,
          tokenJwt
        }
      }
    } catch (error) {
      console.log(error);
      return error.message
    }
  }


  async getCountId() {
    const data = await this.userModel.find()
    return data.length + 1
  }

  async googleLogin(@Req() req, @Res() res) {
    if (!req.user) {
      return {
        data: {},
        msg: 'No user from google'
      }
    }
    const userLogin = await this.userModel.findOne({ email: req.user.email })
    console.log(userLogin);

    if (userLogin === null) {
      return {
        data: this.jwtService.sign({ data: JSON.stringify({ ...req.user }) }),
        msg: 'register'
      }
    }

    // const isValid = await bcrypt.compare(req.user.password, userLogin.password)
    // if (!isValid) {
    //   return {
    //     status: 400,
    //     message: 'email and password not match'
    //   }
    // }

    const tokenJwt = this.jwtService.sign({ id_user: userLogin.id_user })
    // console.log(req.user);

    return {
      data: this.jwtService.sign({ data: JSON.stringify({ ...req.user, tokenJwt }) }),
      msg: req.user.accessToken
    }
  }

  async facebookLogin(@Req() req, @Res() res) {
    if (!req.user) {
      return {
        data: {},
        msg: 'No user from facebook'
      }
    }
    const userLogin = await this.userModel.findOne({ email: req.user.user.email })
    const tokenJwt = this.jwtService.sign({ id_user: userLogin.id_user })

    if (userLogin === null) {
      return {
        data: this.jwtService.sign({ data: JSON.stringify({ ...req.user.user }) }),
        msg: 'register'
      }
    }


    return {
      data: this.jwtService.sign({ data: JSON.stringify({ ...req.user.user, tokenJwt }) }),
      msg: 'FB'
    }
  }

  async forgotPassword(forgotDto: ForgotDto) {
    const { email, password, password_baru, kode_unik } = forgotDto

    const userLogin = await this.userModel.findOne({ email: email })
    if (userLogin === null) {
      return {
        status: 400,
        message: 'email tidak ditemukan !'
      }
    }
    if (userLogin.kode_unik !== kode_unik) {
      return {
        status: 400,
        message: 'Kode unik yang anda masukan salah !'
      }
    }

    const isValid = await bcrypt.compare(password, userLogin.password)
    if (!isValid) {
      return {
        status: 400,
        message: 'password lama yang anda masukan salah !'
      }
    }

    await this.userModel.findByIdAndUpdate(userLogin._id, {
      password: password_baru
    })


    return {
      status: 200,
      message: 'sukses ganti password'
    }
  }
}
