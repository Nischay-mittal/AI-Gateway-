import {createHash} from "node:crypto";

interface CacheEntry<T>{
    data: T;
    expiresAt: number;
}

export class InMemorycache{
    private store = new Map<string, CacheEntry<unknown>>();

    generateKey(input: unknown): string {
        const str=JSON.stringify(input);
        return createHash("sha256").update(str).digest("hex");
    }
    get<T>(key: string): T | null{
         const entry=this.store.get(key);
         if(!entry)
         {
            return null;
        }
         if(Date.now()> entry.expiresAt)
         {
            this.store.delete(key);
            return null;
         }

         return entry.data as T;
      
    }
    set<T>(key:string, data:T, ttlMs: number = 60000):void{
        this.store.set(key,{data,expiresAt: Date.now()+ttlMs});
    }
    clear():void{
        this.store.clear();
    }
}

export const responseCache= new InMemorycache();