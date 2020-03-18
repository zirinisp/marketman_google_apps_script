namespace Marketman {
    /* ACTUAL VS THEORITICAL */
    export class ActualVsTheoritical {
        isSuccess: boolean;
        errorMessage: string;
        errorCode: string;
        items: AVTItem[];
        startDate: Date;
        endDate: Date;
        buyerGUID: string;

        constructor(
            isSuccess: boolean,
            errorMessage: string,
            errorCode: string,
            items: AVTItem[],
            startDate: Date,
            endDate: Date,
            buyerGUID: string
        ) {
            this.items = items
            this.isSuccess = isSuccess;
            this.errorMessage = errorMessage;
            this.errorCode = errorCode;
            this.startDate = startDate;
            this.endDate = endDate;
            this.buyerGUID = buyerGUID;
        }

        public static fromJSON(json: { [id: string]: any }, startDate: Date, endDate: Date, buyerGUID: string): ActualVsTheoritical {
            return new ActualVsTheoritical(
                json.IsSuccess,
                json.ErrorMessage,
                json.ErrorCode,
                AVTItem.fromJSONArray(json.Items, startDate, endDate),
                startDate,
                endDate,
                buyerGUID
            );
        }
        public toFlatArray(): [{ [id: string]: any }] {

            var data: [{ [id: string]: any }] = [{}];
            data.pop();
            this.items.forEach(item => {
                data.push(item.toFlatDictionary());
            });
            return data;
        }

        // Does not work as the name contains the count value also.
        public itemForName(name: string): AVTItem | null {
            this.items.forEach(item => {
                if (item.itemName == name) {
                    return item;
                }
            });
            return null;
        }
        public itemWithID(id: string): AVTItem {
            var searchItem: AVTItem = null;
            this.items.forEach(item => {
            if (item.itemID.match(id) !== null) {
                    searchItem = item;
                    return;
                }
            });
            Logger.log(searchItem);
        return searchItem;
        }

    }
/*
    function stringComparison(s1, s2) {
        // lets test both variables are the same object type if not throw an error
        if (Object.prototype.toString.call(s1) !== Object.prototype.toString.call(s2)) {
            throw ("Both values need to be an array of cells or individual cells")
        }
        // if we are looking at two arrays of cells make sure the sizes match and only one column wide
        if (Object.prototype.toString.call(s1) === '[object Array]') {
            if (s1.length != s2.length || s1[0].length > 1 || s2[0].length > 1) {
                throw ("Arrays of cells need to be same size and 1 column wide");
            }
            // since we are working with an array intialise the return
            var out = [];
            for (r in s1) { // loop over the rows and find differences using diff sub function
                out.push([diff(s1[r][0], s2[r][0])]);
            }
            return out; // return response
        } else { // we are working with two cells so return diff
            return diff(s1, s2)
        }
    }

    function diff(s1, s2) {
        var out = "[ ";
        var notid = false;
        // loop to match each character
        for (var n = 0; n < s1.length; n++) {
            if (s1.charAt(n) == s2.charAt(n)) {
                out += "–";
            } else {
                out += s2.charAt(n);
                notid = true;
            }
            out += " ";
        }
        out += " ]"
        return (notid) ? out : "[ id. ]"; // if notid(entical) return output or [id.]
    }*/

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
        startDate: Date;
        endDate: Date;


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
            differencePercentage: number,
            startDate: Date,
            endDate: Date
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
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public static fromJSON(json: { [id: string]: any }, startDate: Date, endDate: Date): AVTItem {
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
                json.DifferencePercentage,
                startDate,
                endDate
            );
        }


        public static fromJSONArray(jsonArray: [], startDate: Date, endDate: Date): AVTItem[] {
            var items: AVTItem[] = [];
            jsonArray.forEach(json => {
                items.push(AVTItem.fromJSON(json, startDate, endDate));
            });
            return items;
        }

        public static emptyItem(name: string, startDate: Date, endDate: Date) {
            return AVTItem.fromJSON({ "itemName": name }, startDate, endDate);
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
                "differencePercentage": this.differencePercentage,
                "startDate": this.startDate,
                "endDate": this.endDate
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