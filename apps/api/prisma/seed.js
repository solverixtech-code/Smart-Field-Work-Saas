"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const argon2 = __importStar(require("argon2"));
const prisma = new client_1.PrismaClient();
async function main() {
    const defaultPassword = await argon2.hash('Visiblo@2025');
    const users = [
        {
            employeeCode: 'VIS-SA-001',
            fullName: 'Amit Sharma',
            email: 'amit.sharma@visibloai.com',
            role: client_1.Role.SUPER_ADMIN,
            mobile: '+919876543210',
        },
        {
            employeeCode: 'VIS-ADM-001',
            fullName: 'Priya Mehta',
            email: 'priya.mehta@visibloai.com',
            role: client_1.Role.ADMIN,
            mobile: '+919876543211',
        },
        {
            employeeCode: 'VIS-SM-001',
            fullName: 'Ravi Kumar',
            email: 'ravi.kumar@visibloai.com',
            role: client_1.Role.SALES_MANAGER,
            mobile: '+919876543212',
        },
        {
            employeeCode: 'VIS-TL-001',
            fullName: 'Sneha Iyer',
            email: 'sneha.iyer@visibloai.com',
            role: client_1.Role.TEAM_LEADER,
            mobile: '+919876543213',
        },
        {
            employeeCode: 'VIS-FO-001',
            fullName: 'Vikram Singh',
            email: 'vikram.singh@visibloai.com',
            role: client_1.Role.FINANCE_OPS,
            mobile: '+919876543214',
        },
        {
            employeeCode: 'VIS-SP-001',
            fullName: 'Neha Gupta',
            email: 'neha.gupta@visibloai.com',
            role: client_1.Role.SUPPORT,
            mobile: '+919876543215',
        },
        {
            employeeCode: 'PLAT-SA-001',
            fullName: 'Sahibjit Singh',
            email: 'platform.admin@smartfieldwork.com',
            role: client_1.Role.PLATFORM_SUPER_ADMIN,
            mobile: '+919900000001',
        },
        {
            employeeCode: 'PLAT-OPS-001',
            fullName: 'Rajesh Operations',
            email: 'platform.ops@smartfieldwork.com',
            role: client_1.Role.PLATFORM_OPERATIONS_ADMIN,
            mobile: '+919900000002',
        },
        {
            employeeCode: 'PLAT-ONB-001',
            fullName: 'Neha Onboarding',
            email: 'platform.onboarding@smartfieldwork.com',
            role: client_1.Role.PLATFORM_ONBOARDING,
            mobile: '+919900000003',
        },
        {
            employeeCode: 'PLAT-SUP-001',
            fullName: 'Support Helpdesk',
            email: 'platform.support@smartfieldwork.com',
            role: client_1.Role.PLATFORM_SUPPORT,
            mobile: '+919900000004',
        },
        {
            employeeCode: 'PLAT-BIL-001',
            fullName: 'Finance Billing',
            email: 'platform.billing@smartfieldwork.com',
            role: client_1.Role.PLATFORM_BILLING,
            mobile: '+919900000005',
        },
        {
            employeeCode: 'PLAT-AUD-001',
            fullName: 'Audit Compliance',
            email: 'platform.auditor@smartfieldwork.com',
            role: client_1.Role.PLATFORM_AUDITOR,
            mobile: '+919900000006',
        },
    ];
    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                passwordHash: defaultPassword,
                fullName: u.fullName,
                role: u.role,
                status: 'ACTIVE',
            },
            create: {
                employeeCode: u.employeeCode,
                fullName: u.fullName,
                email: u.email,
                passwordHash: defaultPassword,
                role: u.role,
                mobile: u.mobile,
                status: 'ACTIVE',
            },
        });
    }
    await prisma.team.upsert({
        where: { code: 'MUMBAI-WEST' },
        update: {},
        create: {
            name: 'Mumbai West',
            code: 'MUMBAI-WEST',
            description: 'Field sales team covering western Mumbai',
        },
    });
    const twoFactorRoles = [
        { role: client_1.Role.SUPER_ADMIN, enabled: true },
        { role: client_1.Role.ADMIN, enabled: false },
        { role: client_1.Role.SALES_MANAGER, enabled: false },
        { role: client_1.Role.TEAM_LEADER, enabled: false },
        { role: client_1.Role.FINANCE_OPS, enabled: false },
        { role: client_1.Role.SUPPORT, enabled: false },
        { role: client_1.Role.PLATFORM_SUPER_ADMIN, enabled: true },
        { role: client_1.Role.PLATFORM_OPERATIONS_ADMIN, enabled: false },
        { role: client_1.Role.PLATFORM_ONBOARDING, enabled: false },
        { role: client_1.Role.PLATFORM_SUPPORT, enabled: false },
        { role: client_1.Role.PLATFORM_BILLING, enabled: false },
        { role: client_1.Role.PLATFORM_AUDITOR, enabled: false },
    ];
    for (const setting of twoFactorRoles) {
        await prisma.roleTwoFactorSetting.upsert({
            where: { role: setting.role },
            update: { enabled: setting.enabled },
            create: { role: setting.role, enabled: setting.enabled },
        });
    }
    console.log('Seed completed. Default password: Visiblo@2025');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map