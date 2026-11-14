import {Queue} from 'bullmq';
import IORedis from 'ioredis';
let queue:Queue|undefined;
export function studioQueue(){if(!process.env.REDIS_URL)throw new Error('REDIS_URL is not configured');if(!queue){const connection=new IORedis(process.env.REDIS_URL,{maxRetriesPerRequest:null});queue=new Queue('verse-studio',{connection});}return queue;}
