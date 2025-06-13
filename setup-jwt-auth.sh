#!/bin/bash

# Colores para mejor legibilidad
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}Iniciando configuración de JWT para NestJS...${NC}"

# Crear estructura de directorios
echo -e "${BLUE}Creando estructura de carpetas...${NC}"
mkdir -p src/auth/dto
mkdir -p src/auth/guards
mkdir -p src/auth/strategies

# Crear configuración JWT
echo -e "${BLUE}Creando configuración JWT...${NC}"
cat > src/config/jwt.config.ts << 'EOF'
export const jwtConfig = () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'tu-clave-secreta-por-defecto',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
});
EOF

# Crear DTOs
echo -e "${BLUE}Creando DTOs para autenticación...${NC}"
cat > src/auth/dto/login.dto.ts << 'EOF'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
EOF

# Crear estrategias
echo -e "${BLUE}Creando estrategias de autenticación...${NC}"
cat > src/auth/strategies/local.strategy.ts << 'EOF'
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
EOF

cat > src/auth/strategies/jwt.strategy.ts << 'EOF'
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    try {
      // Payload contiene el userId que almacenamos al crear el token
      const user = await this.usersService.findOne(payload.sub);
      return user;
    } catch (error) {
      throw new UnauthorizedException('User no longer exists');
    }
  }
}
EOF

# Crear guards
echo -e "${BLUE}Creando guards de autenticación...${NC}"
cat > src/auth/guards/jwt-auth.guard.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
EOF

cat > src/auth/guards/local-auth.guard.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
EOF

# Crear servicio de autenticación
echo -e "${BLUE}Creando servicio de autenticación...${NC}"
cat > src/auth/auth.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../modules/users/users.service';
import { User } from '../entities/user.entity';
import { UserResponseDto } from '../modules/users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Obtenemos el usuario completo con la contraseña para verificación
      const user = await this.usersService.findByEmail(email);
      
      // Verificamos la contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (isPasswordValid) {
        // No queremos devolver la contraseña
        const { password, ...result } = user;
        return result;
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: new UserResponseDto(user),
    };
  }

  // Método para verificar el token (útil para endpoint de validación)
  async verifyToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.sub, email: payload.email };
    } catch (error) {
      return null;
    }
  }
}
EOF

# Crear controlador de autenticación
echo -e "${BLUE}Creando controlador de autenticación...${NC}"
cat > src/auth/auth.controller.ts << 'EOF'
import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
EOF

# Crear módulo de autenticación
echo -e "${BLUE}Creando módulo de autenticación...${NC}"
cat > src/auth/auth.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../modules/users/users.module';
import { jwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.secret'),
        signOptions: { expiresIn: configService.get('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
EOF

# Crear/modificar .env
echo -e "${BLUE}Añadiendo variables JWT a .env...${NC}"
if [ -f .env ]; then
  # Si el archivo existe, añadir las variables si no están presentes
  grep -q "JWT_SECRET" .env || echo "JWT_SECRET=tu_clave_secreta_muy_segura" >> .env
  grep -q "JWT_EXPIRES_IN" .env || echo "JWT_EXPIRES_IN=1d" >> .env
else
  # Si el archivo no existe, crearlo
  cat > .env << 'EOF'
JWT_SECRET=tu_clave_secreta_muy_segura
JWT_EXPIRES_IN=1d
EOF
fi

# Actualizar app.module.ts
echo -e "${BLUE}Actualizando app.module.ts...${NC}"
# Crear una versión temporal del archivo
cat > src/app.module.ts.tmp << 'EOF'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { FoundationsModule } from './modules/foundations/foundations.module';
import { DonationsModule } from './modules/donations/donations.module';
import { SocialActionsModule } from './modules/social-actions/social-actions.module';
import { CommentsModule } from './modules/comments/comments.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { ParticipationRequestsModule } from './modules/participation-requests/participation-requests.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SuggestionsModule } from './modules/suggestions/suggestions.module';
import { AuthModule } from './auth/auth.module';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';

@Module({
  imports: [
    // Configuración
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig],
    }),
    
    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    
    // Módulos de la aplicación
    AuthModule, // Módulo de autenticación
    UsersModule,
    FoundationsModule,
    DonationsModule,
    SocialActionsModule,
    CommentsModule,
    RatingsModule,
    ParticipationRequestsModule,
    CertificatesModule,
    NotificationsModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
EOF

# Reemplazar el archivo original con el nuevo
mv src/app.module.ts.tmp src/app.module.ts

# Instrucciones para instalar dependencias
echo -e "${GREEN}Archivos de JWT creados exitosamente!${NC}"
echo -e "${BLUE}Para completar la instalación, ejecuta:${NC}"
echo -e "npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local"
echo -e "${GREEN}Ahora puedes utilizar autenticación JWT en tu proyecto.${NC}"
echo -e "Las rutas disponibles son:"
echo -e " - POST /auth/login (para iniciar sesión)"
echo -e " - GET /auth/profile (para obtener perfil de usuario, requiere token JWT)"
echo -e "${BLUE}Para proteger una ruta, usa el guard JwtAuthGuard:${NC}"
echo -e "@UseGuards(JwtAuthGuard)"