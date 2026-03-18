import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SocialAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token is missing or invalid');
    }

    try {
      const coreServiceUrl = process.env.HRM_CORE_SERVICE_URL;
      
      const response = await firstValueFrom(
        this.httpService.get(`${coreServiceUrl}/Auth/VerifyToken`, {
          headers: { Authorization: authHeader },
        })
      );

      request.user = response.data;
      return true;

    } catch (error) {
      throw new UnauthorizedException('Invalid Token or HRM Core Service is down');
    }
  }
}