export interface GatewayMetrics{
    totalRequests:number;
    successfulRequests:number;
    failedRequests:number;
    streamRequests:number;
    cacheHits:number;
    cacheMisses:number;
    totalTokensProcessed:number;
    estimatedCostUsd:number;
    modelUsage:Record<string, number>;
}

class MetricsCollector{
    private metrics: GatewayMetrics={
        totalRequests:0,
        successfulRequests: 0,
        failedRequests: 0,
        streamRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalTokensProcessed: 0,
        estimatedCostUsd: 0,
        modelUsage: {},
    };


    private startTime=Date.now();

    recordrequest():void{
        this.metrics.totalRequests++;
    }

    recordSuccess(): void {
    this.metrics.successfulRequests++;
    }

    recordFailure(): void {
    this.metrics.failedRequests++;
    }

    recordStream(): void {
    this.metrics.streamRequests++;
    } 

    recordCacheHit(): void {
    this.metrics.cacheHits++;
    }

    recordCacheMiss(): void {
    this.metrics.cacheMisses++;
    }

    recordTokensAndCost(model: string, tokens:number, cost:number):void{
        this.metrics.totalTokensProcessed+=tokens;
        this.metrics.estimatedCostUsd= Number(
            (this.metrics.estimatedCostUsd + cost).toFixed(6)
        );
        this.metrics.modelUsage[model]=(this.metrics.modelUsage[model] || 0)+1;
    }

    getSnapshot(){
        const memoryUsage=process.memoryUsage();
        const uptimeSeconds= Math.floor((Date.now()-this.startTime)/1000);

        return {
            uptimeSeconds,
            timestamp: new Date().toISOString(),
            process:{
                pid:process.pid,
                nodeVersion: process.version,
                memory:{
                    heapUsedMb: Number((memoryUsage.heapUsed/1024/1024).toFixed(2)),
                    heapTotalMb: Number((memoryUsage.heapTotal/1024/1024).toFixed(2)),
                    rssMb: Number((memoryUsage.rss/1024/1024).toFixed(2)),
                },
            },
            traffic:{...this.metrics},
        };
    }

}

export const metricsCollector=new MetricsCollector();