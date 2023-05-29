import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { KegiatansService } from './kegiatans.service';
import { AddKegiatanDto } from './dto/addKegiatan.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateKegiatanDto } from './dto/updateKegiatan.dto';
import { TambahAnggotaDto } from './dto/tambahAnggota.dto';

@Controller('api/v1')
export class KegiatansController {
  constructor(private readonly kegiatansService: KegiatansService) { }

  @UseGuards(AuthGuard())
  @Post('/tambah-kegiatan')
  async create(@Req() req: any, @Body() addKegiatanDto: AddKegiatanDto) {
    return await this.kegiatansService.tambahKegiatan(req, addKegiatanDto);
  }

  @UseGuards(AuthGuard())
  @Get('/kegiatan-milik-saya')
  async myKegiatan(@Req() req: any) {
    return await this.kegiatansService.kegiatanMilikSaya(req);
  }

  @UseGuards(AuthGuard())
  @Get('/kegiatan-yang-saya-ikuti')
  async myFollowingKegiatan(@Req() req: any) {
    return await this.kegiatansService.kegiatanYgSayaIkuti(req);
  }

  @UseGuards(AuthGuard())
  @Get('/detail-kegiatan-milik-saya/:id_kegiatan')
  async myDetailKegiatan(@Req() req: any, @Param('id_kegiatan') id_kegiatan: string) {
    return await this.kegiatansService.getDetailKegiatanMilikSaya(req, id_kegiatan);
  }

  @UseGuards(AuthGuard())
  @Get('/detail-kegiatan-yang-saya-ikuti/:id_kegiatan')
  async myDetailKegiatanYgSayaIkuti(@Req() req: any, @Param('id_kegiatan') id_kegiatan: string) {
    return await this.kegiatansService.getDetailKegiatanYgSayaIkuti(req, id_kegiatan);
  }

  @UseGuards(AuthGuard())
  @Delete('/delete-kegiatan-milik-saya/:id_kegiatan')
  async deleteMyKegiatan(@Req() req: any, @Param('id_kegiatan') id_kegiatan: string) {
    return await this.kegiatansService.deleteKegiatanMilikSaya(req, id_kegiatan);
  }

  @UseGuards(AuthGuard())
  @Put('/update-kegiatan-milik-saya')
  async updateMyKegiatan(@Body() updateKegiatanDto: UpdateKegiatanDto) {
    return await this.kegiatansService.updateKegiatanMilikSaya(updateKegiatanDto);
  }

  @UseGuards(AuthGuard())
  @Post('/tambah-anggota')
  async addAnggota(@Req() req: any, @Body() tambahAnggotaDto: TambahAnggotaDto) {
    return await this.kegiatansService.tambahAnggotaSaya(req, tambahAnggotaDto);
  }

  @UseGuards(AuthGuard())
  @Delete('/delete-anggota/:id_user')
  async deleteAnggota(@Req() req: any, @Param('id_user') id_user: string) {
    return await this.kegiatansService.deleteAnggota(req, id_user);
  }

  @UseGuards(AuthGuard())
  @Get('/get-invitations')
  async getInvitations(@Req() req: any) {
    return await this.kegiatansService.getInvitations(req);
  }

  @UseGuards(AuthGuard())
  @Get('/accept-invitation/:_id')
  async acceptInvitation(@Param('_id') _id: string) {
    return await this.kegiatansService.acceptInvitation(_id);
  }

  @UseGuards(AuthGuard())
  @Get('/refuse-invitation')
  async refuseInvitation(@Req() req: any) {
    return await this.kegiatansService.refuseInvitation(req);
  }

  @UseGuards(AuthGuard())
  @Delete('/delete-kegiatan-saya-ikuti/:id_kegiatan')
  async deleteKegiatanYgSayaIkuti(@Req() req: any, @Param('id_kegiatan') id_kegiatan: string) {
    return await this.kegiatansService.deleteKegiatanYgSayaIkuti(req, id_kegiatan);
  }

  @UseGuards(AuthGuard())
  @Post('/add-calender-google')
  async addToGoogleCalender(@Body() body: { _id: string, event: any, access: string }, @Req() req: any) {
    return await this.kegiatansService.addToGoogleCalender(body, req);
  }

  @UseGuards(AuthGuard())
  @Get('/check')
  ForgotPassword() {
    return { message: 'sukses' }
  }
}
