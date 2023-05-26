import { Body, Controller, Get, Post, Request, UseGuards, Response, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleOAuthGuard } from './google-oauth.guard';
import { GoogleAuthDto } from './dto/googleAuth.dto';
import { ForgotDto } from './dto/forgot.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/v1')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/login-google')
  loginGoogle(@Body() googleAuthDto: GoogleAuthDto) {
    return this.authService.loginGoogle(googleAuthDto);
  }

  @Get('/google')
  @UseGuards(GoogleOAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuth(@Request() req) { }

  @Get('/google-redirect')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res) {
    const auth = await this.authService.googleLogin(req, res);
    if (auth.msg !== 'No user from google') {
      return res.redirect(`${process.env.CLIENT}dashboard/${auth.msg}/${auth.data}`)
    }
    return res.redirect(`${process.env.CLIENT}`)
  }


  @Get('/facebook')
  @UseGuards(AuthGuard('facebook'))
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async facebookLogin() { }

  @Get('/facebook-redirect')
  @UseGuards(AuthGuard('facebook'))
  async facebookLoginRedirect(@Req() req, @Res() res) {
    const auth = await this.authService.facebookLogin(req, res);
    if (auth.msg !== 'No user from google') {
      return res.redirect(`${process.env.CLIENT}dashboard/${auth.msg}/${auth.data}`)
    }
    return res.redirect(`${process.env.CLIENT}`)
  }

  @Post('/forgot')
  ForgotPassword(@Body() forgoDto: ForgotDto) {
    return this.authService.forgotPassword(forgoDto);
  }
}
