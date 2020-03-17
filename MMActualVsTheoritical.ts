namespace Marketman {
    /* ACTUAL VS THEORITICAL */
    export class ActualVsTheoritical {
        isSuccess: boolean;
        errorMessage: string;
        errorCode: string;
        items: AVTItem[];

        constructor(
            isSuccess: boolean,
            errorMessage: string,
            errorCode: string,
            items: AVTItem[]
        ) {
            this.items = items
            this.isSuccess = isSuccess;
            this.errorMessage = errorMessage;
            this.errorCode = errorCode;
        }

        public static fromJSON(json: { [id: string]: any }): ActualVsTheoritical {
            return new ActualVsTheoritical(
                json.IsSuccess,
                json.ErrorMessage,
                json.ErrorCode,
                AVTItem.fromJSONArray(json.Items)
            );
        }
        public toFlatArray(): [{[id: string] : any}] {

            var data: [{[id: string] : any}] = [{}];
            data.pop();
            this.items.forEach(item => {
                data.push(item.toFlatDictionary());
            });
            return data;
        }
    }

    export class AVTItem {
        id: string;
        itemID: string;
        itemName: string;
        firstCount: number;
        secondCount: number;
        purchases: number;
        sales: number;
        deliveryNotes: number;
        productions: number;
        transfers: number;
        wasteEvents: number;
        usageValue: number;
        categoryName: string;
        categoryID: string;
        cost: number;
        usageValueTheoretical: number;
        totalUsage: number;
        expected: number;
        difference: number;
        differenceValue: number;
        differencePercentage: number;

        constructor(
            id: string,
            itemID: string,
            itemName: string,
            firstCount: number,
            secondCount: number,
            purchases: number,
            sales: number,
            deliveryNotes: number,
            productions: number,
            transfers: number,
            wasteEvents: number,
            usageValue: number,
            categoryName: string,
            categoryID: string,
            cost: number,
            usageValueTheoretical: number,
            totalUsage: number,
            expected: number,
            difference: number,
            differenceValue: number,
            differencePercentage: number
        ) {
            this.id = id;
            this.itemID = itemID;
            this.itemName = itemName;
            this.firstCount = firstCount;
            this.secondCount = secondCount;
            this.purchases = purchases;
            this.sales = sales;
            this.deliveryNotes = deliveryNotes;
            this.productions = productions;
            this.transfers = transfers;
            this.wasteEvents = wasteEvents;
            this.usageValue = usageValue;
            this.categoryName = categoryName;
            this.categoryID = categoryID;
            this.cost = cost;
            this.usageValueTheoretical = usageValueTheoretical;
            this.totalUsage = totalUsage;
            this.expected = expected;
            this.difference = difference;
            this.differenceValue = differenceValue;
            this.differencePercentage = differencePercentage;
        }

        public static fromJSON(json: { [id: string]: any }): AVTItem {
            return new AVTItem(
                json.ID,
                json.ItemID,
                json.ItemName,
                json.FirstCount,
                json.SecondCount,
                json.Purchases,
                json.Sales,
                json.DeliveryNotes,
                json.Productions,
                json.Transfers,
                json.WasteEvents,
                json.UsageValue,
                json.CategoryName,
                json.CategoryID,
                json.Cost,
                json.UsageValueTheoretical,
                json.TotalUsage,
                json.Expected,
                json.Difference,
                json.DifferenceValue,
                json.DifferencePercentage
            );
        }


        public static fromJSONArray(jsonArray: []): AVTItem[] {
            var items: AVTItem[] = [];
            jsonArray.forEach(json => {
                items.push(AVTItem.fromJSON(json));
            });
            return items;
        }

        public toFlatDictionary(): { [id: string]: any } {

            var data = {
                "id": this.id,
                "itemID": this.itemID,
                "itemName": this.itemName,
                "firstCount": this.firstCount,
                "secondCount": this.secondCount,
                "purchases": this.purchases,
                "sales": this.sales,
                "deliveryNotes": this.deliveryNotes,
                "productions": this.productions,
                "transfers": this.transfers,
                "wasteEvents": this.wasteEvents,
                "usageValue": this.usageValue,
                "categoryName": this.categoryName,
                "categoryID": this.categoryID,
                "cost": this.cost,
                "usageValueTheoretical": this.usageValueTheoretical,
                "totalUsage": this.totalUsage,
                "expected": this.expected,
                "difference": this.difference,
                "differenceValue": this.differenceValue,
                "differencePercentage": this.differencePercentage
            }
            return data;
        }

        public static headers(): string[] {
            var headers = [
                "id",
                "itemID",
                "itemName",
                "firstCount",
                "secondCount",
                "purchases",
                "sales",
                "deliveryNotes",
                "productions",
                "transfers",
                "wasteEvents",
                "usageValue",
                "categoryName",
                "categoryID",
                "cost",
                "usageValueTheoretical",
                "totalUsage",
                "expected",
                "difference",
                "differenceValue",
                "differencePercentage"
            ];
            return headers;
        }


    }
}    