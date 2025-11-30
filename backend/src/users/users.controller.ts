import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribe')
    async subscribe(@Request() req, @Body() subscription: any) {
        await this.usersService.addPushSubscription(req.user.userId, subscription);
        return { message: 'Subscription added successfully' };
    }
}
