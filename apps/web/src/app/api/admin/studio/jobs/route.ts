import {NextResponse} from 'next/server';
import {canAdmin} from '@/lib/admin';
import {prisma} from '@/lib/db';
export async function GET(){if(!await canAdmin())return NextResponse.json({error:'Forbidden'},{status:403});try{const jobs=await prisma.jobRun.findMany({orderBy:{createdAt:'desc'},take:30,select:{id:true,kind:true,status:true,total:true,processed:true,createdAt:true,completedAt:true,error:true}});return NextResponse.json({jobs})}catch{return NextResponse.json({error:'DB not configured'},{status:503})}}
