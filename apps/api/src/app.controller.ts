import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Root')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'API Root & Welcome Message' })
  @ApiResponse({ status: 200, description: 'Returns welcome message from the creators' })
  getHello() {
    return {
      name: 'Visiblo Smart Field Work API',
      status: 'online',
      message: 'Welcome to the Visiblo Smart Field Work SaaS Engine!',
      creators: {
        sahibjitSingh: {
          name: 'Sahibjit Singh',
          role: 'Architect & Lead Visionary',
          coolnessLevel: 'Infinite ⚡',
          bio: 'Mastermind behind Visiblo Smart Field Work. Architecting ultra-scalable field workforce algorithms, real-time GPS tracking engines, and enterprise-grade SaaS infrastructure.',
        },
        anuraagRandive: {
          name: 'Anuraag Randive',
          role: 'Co-Architect & Technical Vanguard',
          coolnessLevel: 'Maximum Overdrive 🚀',
          bio: 'The engineering powerhouse building bulletproof backend services, high-throughput data pipelines, and seamless developer experiences for mobile and web apps.',
        },
      },
      legendaryNote:
        'Built with sheer brilliance, rock-solid security, and precision by Sahibjit Singh & Anuraag Randive. Powered by NestJS, Prisma, and Redis.',
      documentation: '/docs',
      timestamp: new Date().toISOString(),
    };
  }
}
