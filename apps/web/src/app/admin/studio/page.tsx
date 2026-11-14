import {canAdmin} from '@/lib/admin';
import StudioControls from '@/components/StudioControls';
import Link from 'next/link';
export default async function Studio(){if(!await canAdmin())return <div className="page-wrap"><h1>Forbidden</h1><Link href="/login">Staff sign in</Link></div>;return <div className="page-wrap"><p className="kicker dark">CREATIVE PRODUCTION / INTERNAL</p><h1 className="page-title">Design studio<span>.</span></h1><p className="page-lead">Generate or assemble draft concepts in bounded batches. This worker does not pretend an external image model is connected. All outputs require review and real print proofs.</p><StudioControls/></div>}
