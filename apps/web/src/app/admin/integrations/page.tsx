import Link from 'next/link';
import {gateAdmin} from '@/lib/admin';
import {AdminDenied} from '@/components/admin/AdminGate';
import IntegrationControls from '@/components/IntegrationControls';
import {PERMISSIONS} from '@/modules/admin/shared/permissions';
import {listIntegrations,type IntegrationDto} from '@/modules/admin/integrations/integrations.service';

export const dynamic='force-dynamic';

export default async function Integrations(){
 const gate=await gateAdmin(PERMISSIONS.integrations);
 if(gate.state!=='ok')return <AdminDenied gate={gate} area="integrations (superadmin only)"/>;
 let integrations:IntegrationDto[]|null=null;
 try{integrations=await listIntegrations()}catch{integrations=null}
 return <div className="page-wrap"><p className="kicker dark">SECURITY / STAFF ONLY</p><h1 className="page-title">Integrations<span>.</span></h1><p className="page-lead">Store credential payloads encrypted in PostgreSQL; the master key must be a Railway variable. Saving a secret does not mean the provider connection is validated — use TEST CONNECTION.</p>
  {integrations===null?<p className="notice">Database unavailable. Integration settings cannot be shown or changed.</p>:<IntegrationControls integrations={integrations}/>}
  <p><Link className="text-link" href="/admin">← COMMAND CENTER</Link></p></div>}
