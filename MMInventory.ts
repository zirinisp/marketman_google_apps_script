
namespace Marketman {
    export class AuthorisedAccounts {
        constructor(
            isSuccess: boolean,
            errorMessage: string,
            errorCode: string,
            buyers: Buyer[],
            vendors: any[],
            chains: Chain[],
            timestamp: Date = new Date()) {
                this.isSuccess = isSuccess;
                this.errorMessage = errorMessage;
                this.errorCode = errorCode;
                this.buyers = buyers;
                this.vendors = vendors;
                this.chains = chains;
                this.timestamp = timestamp;
        }

        public static fromJSON(json: {[id: string] : any}): AuthorisedAccounts {
            return new AuthorisedAccounts(
                json.IsSuccess, 
                json.ErrorMessage, 
                json.ErrorCode, 
                Buyer.fromJSONArray(json.Buyers), // TODO: Array
                json.Vendors, // TODO: Array
                Chain.fromJSONArray(json.Chains)
            );
        }

        isSuccess: boolean;
        errorMessage: string;
        errorCode: string;
        buyers: Buyer[];
        vendors: any[];
        chains: Chain[];
        timestamp: Date; // Date data were requested

        public allBuyers(): Buyer[] {
            // TODO: Merge chain buyers with buyers
            var allBuyers: Buyer[] = [];

            this.buyers.forEach((element: Buyer) => {
                allBuyers.push(element);
            });
            this.chains.forEach((chain: Chain) => {
                chain.buyers.forEach((element: Buyer) => {
                    allBuyers.push(element);
                });
            });
            return allBuyers;
        }

        public buyersContaining(name: string): Buyer[] {
            var buyers: Buyer[] = [];
            this.allBuyers().forEach((buyer: Buyer) => {
                if (buyer.name.includes(name)) {
                    buyers.push(buyer);
                }
            })
            return buyers;
        }
    }

    export class Chain {
        chainName: string;
        guid: string;
        buyers: Buyer[];

        constructor(
            chainName: string,
            guid: string,
            buyers: Buyer[]    
        ) {
            this.chainName = chainName;
            this.guid = guid;
            this.buyers = buyers;
        }

        public static fromJSON(json: {[id: string] : any}): Chain {
            return new Chain(
                json.ChainName, 
                json.Guid, 
                Buyer.fromJSONArray(json.Buyers)
            );
        }

        public static fromJSONArray(jsonArray: []): Chain[] {
            var chains: Chain[] = [];
            jsonArray.forEach(json => {
                chains.push(Chain.fromJSON(json));
            });
            return chains;
        }

    }

    export class Buyer {
        name: string;
        guid: string;

        constructor(
            name: string,
            guid: string,
        ) {
            this.name = name;
            this.guid = guid;
        }

        public static fromJSON(json: {[id: string] : any}): Buyer {
            return new Buyer(
                json.BuyerName, 
                json.Guid
            );
        }

        public static fromJSONArray(jsonArray: []): Buyer[] {

            var chains: Buyer[] = [];
            jsonArray.forEach(json => {
                var buyer = Buyer.fromJSON(json);
                chains.push(buyer);
            });
            return chains;
        }
    }
}