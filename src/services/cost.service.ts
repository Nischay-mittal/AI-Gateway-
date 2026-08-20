interface ModelPricing{
    promptCostPerMillion: number;
    completionCostPerMillion: number;
}

export interface UsageReport {
    promptTokens:number;
    completionTokens: number;
    totalTokens: number;
    costUsd : number;
}

export class CostService{
    private static pricingTable: Record<string, ModelPricing>={
        "gpt-4o":{
            promptCostPerMillion: 2.50,
            completionCostPerMillion: 10.00,
        },
        "claude-3-5-sonnet":{
            promptCostPerMillion: 3.00,
            completionCostPerMillion: 15.00,
        },
        "gemini-1.5-pro":{
            promptCostPerMillion: 3.50,
            completionCostPerMillion: 10.50,
        },
        "gemini-2.5-flash": {
            promptCostPerMillion: 0.15,
            completionCostPerMillion: 0.60,
    },
    };
    
    private static getPricing(model: string): ModelPricing {
    const normalized = (model || "").toLowerCase();

    // 1. Direct exact match
    if (this.pricingTable[normalized]) {
      return this.pricingTable[normalized];
    }

    // 2. Prefix / Substring matching for snapshot model strings
    const matchedKey = Object.keys(this.pricingTable).find((key) =>
      normalized.includes(key) || key.includes(normalized)
    );

    if (matchedKey && this.pricingTable[matchedKey]) {
      return this.pricingTable[matchedKey];
    }

    
    return {
      promptCostPerMillion: 0,
      completionCostPerMillion: 0,
    };
    }

    static calculationCost(
        model: string,
        promptTokens: number,
        completionTokens: number
    ): UsageReport {
        const pricing = this.getPricing(model);

        const promptCost=(promptTokens/1000000)*pricing.promptCostPerMillion;
        const completionCost=(completionTokens/1000000)*pricing.completionCostPerMillion;
        const totalCost = Number((promptCost + completionCost).toFixed(6));

        return {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens+completionTokens,
            costUsd : totalCost,
        };
    }
}