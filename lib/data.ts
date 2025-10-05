import demo from '../public/data/demo.json'
export type Item={id:string;name:string;type:string;revision:string;description:string;status:string;supplier:string;cost:number;health_pct:number;notes:string}
export type Request={id:string;title:string;description:string;origin:string;priority:'High'|'Medium'|'Low';linked_item:string;status:string}
export type Change={id:string;type:'ECO'|'Variant';title:string;description:string;affected_item:string;from_rev:string;to_rev:string;rationale:string;status:string}
export type LogEntry={year:number;entry:string}
export const dataset=demo as {items:Item[];requests:Request[];changes:Change[];adventure_log:LogEntry[]}
