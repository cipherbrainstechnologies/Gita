import {auth} from "@/auth";
import {prisma} from "@/lib/db";
export type StaffRole="SUPERADMIN"|"MERCHANDISER"|"OPERATIONS"|"SUPPORT"|"FINANCE"|"DESIGNER"|"FRANCHISE_MANAGER";
export async function adminRole():Promise<StaffRole|null>{
 const session=await auth();const email=session?.user?.email?.trim().toLowerCase();
 if(!email)return null;
 const staff=await prisma.adminUser.findUnique({where:{email},select:{role:true,active:true}});
 return staff?.active?staff.role:null;
}
export async function canAdmin(roles?: StaffRole[]):Promise<boolean>{const role=await adminRole();return Boolean(role&&(!roles||roles.includes(role)))}
