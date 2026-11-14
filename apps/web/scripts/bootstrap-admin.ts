/** One-time CLI bootstrap; never expose as a public API. */
import {prisma} from '../src/lib/db';
const email=process.argv[2]?.trim().toLowerCase();
if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
 console.error('Usage: npm run admin:bootstrap -- verified-owner@example.com');process.exit(1);
}
const count=await prisma.adminUser.count();
if(count!==0){console.error('A staff account exists; use authenticated superadmin admin management instead.');await prisma.$disconnect();process.exit(1)}
await prisma.adminUser.create({data:{email,role:'SUPERADMIN',active:true}});
console.log('Bootstrapped the first admin email (Google OIDC login still required):',email);
await prisma.$disconnect();
