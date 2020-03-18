namespace Marketman {

    export class InventoryItemsResponse {
        isSuccess: boolean;
        errorMessage: string;
        errorCode: string;
        items: InventoryItem[];
        requestDate: Date;


        constructor(
            isSuccess: boolean,
            errorMessage: string,
            errorCode: string,
            items: InventoryItem[],
            requestDate: Date
        ) {
            this.isSuccess = isSuccess;
            this.errorMessage = errorMessage;
            this.errorCode = errorCode;
            this.items = items;
            this.requestDate = requestDate;
        }

        static fromJSON(json: { [id: string]: any }, requestDate: Date): InventoryItemsResponse {
            return new InventoryItemsResponse(
                json.IsSuccess,
                json.ErrorMessage,
                json.ErrorCode,
                InventoryItem.fromJSONArray(json.Items, requestDate),
                requestDate
            );
        }

        itemsArray(): [{ [id: string]: any }] {
            var data: [{ [id: string]: any }] = [{}];
            data.pop();
            this.items.forEach(item => {
                data.push(...item.toFlatArray());
            });
            return data;
        }


    }

    export class InventoryItem {
        id: string;
        name: string;
        categoryID: number | null;
        categoryName: string;
        uomName: string;
        uomid: number;
        minOnHand: number | null;
        parLevel: number | null;
        storageIDs: number[];
        storageNames: string[];
        onHand: number;
        bomPrice: number;
        debitAccountName: null | string;
        purchaseItems: PurchaseItem[];
        isDeleted: boolean;
        requestDate: Date;

        constructor(
            id: string,
            name: string,
            categoryID: number,
            categoryName: string,
            uomName: string,
            uomid: number,
            minOnHand: number,
            parLevel: number,
            storageIDs: number[],
            storageNames: string[],
            onHand: number,
            bomPrice: number,
            debitAccountName: string,
            purchaseItems: PurchaseItem[],
            isDeleted: boolean,
            requestDate: Date
        ) {
            this.id = id;
            this.name = name;
            this.categoryID = categoryID;
            this.categoryName = categoryName;
            this.uomName = uomName;
            this.uomid = uomid;
            this.minOnHand = minOnHand;
            this.parLevel = parLevel;
            this.storageIDs = storageIDs;
            this.storageNames = storageNames;
            this.onHand = onHand;
            this.bomPrice = bomPrice;
            this.debitAccountName = debitAccountName;
            this.purchaseItems = purchaseItems;
            this.isDeleted = isDeleted;
            this.requestDate = requestDate
        }

        public static fromJSON(json: { [id: string]: any }, requestDate: Date): InventoryItem {
            return new InventoryItem(
                json.ID,
                json.Name,
                json.CategoryID,
                json.CategoryName,
                json.UOMName,
                json.UOMID,
                json.MinOnHand,
                json.ParLevel,
                json.StorageIDs,
                json.StorageNames,
                json.OnHand,
                json.BOMPrice,
                json.DebitAccountName,
                PurchaseItem.fromJSONArray(json.PurchaseItems),
                json.IsDeleted,
                requestDate
            )
        }

        public static fromJSONArray(jsonArray: [], requestDate: Date): InventoryItem[] {
            var items: InventoryItem[] = [];
            jsonArray.forEach(json => {
                items.push(InventoryItem.fromJSON(json, requestDate));
            });
            return items;
        }

        public toFlatArray(): {[id: string] : any}[] {

            var data: {[id: string] : any}[] = [{}];
            data.pop();
            this.purchaseItems.forEach(item => {
                var purchaseItemData = {
                    "id" : this.id,
                    "name" : this.name,
                    "categoryID" : this.categoryID,
                    "categoryName" : this.categoryName,
                    "uomName" : this.uomName,
                    "uomid" : this.uomid,
                    "minOnHand" : this.minOnHand,
                    "parLevel" : this.parLevel,
                    "storageIDs" : this.storageIDs,
                    "storageNames" : this.storageNames,
                    "onHand" : this.onHand,
                    "bomPrice" : this.bomPrice,
                    "debitAccountName" : this.debitAccountName,
                    "isDeleted" : this.isDeleted,
                    "requestDate" : this.requestDate
                }    
                for (let key in item.toFlatDictionary()) {
                    let value = item[key];
                    purchaseItemData["purchaseItem."+key] = value;
                }
                data.push(purchaseItemData);
            });
            return data;
        }

        public static headers(): string[] {
            var headers = [
                "id",
                "name",
                "categoryID",
                "categoryName",
                "uomName",
                "uomid",
                "minOnHand",
                "parLevel",
                "storageIDs",
                "storageNames",
                "onHand",
                "bomPrice",
                "debitAccountName",
                "isDeleted",
                "requestDate"
            ];
            PurchaseItem.headers().forEach(header => {
                headers.push("purchaseItem."+header);
            });
            return headers;
        }
    }

    export class PurchaseItem {
        name: string;
        supplierName: string;
        vendorName: string;
        packQty: number | null;
        packsPerCase: number | null;
        uomName: string;
        uomid: number;
        productCode: null | string;
        price: number;
        minOrderQty: number | null;
        priceType: string;
        ratio: number | null;
        vendorGUID: string;
        catalogItemCode: number;
        taxLevelID: number;
        taxValue: number;
        priceWithVat: number;
        scanBarcode: null | string;

        constructor(
            name: string,
            supplierName: string,
            vendorName: string,
            packQty: number | null,
            packsPerCase: number | null,
            uomName: string,
            uomid: number,
            productCode: null | string,
            price: number,
            minOrderQty: number | null,
            priceType: string,
            ratio: number | null,
            vendorGUID: string,
            catalogItemCode: number,
            taxLevelID: number,
            taxValue: number,
            priceWithVat: number,
            scanBarcode: null | string
        ) {
            this.name = name;
            this.supplierName = supplierName;
            this.vendorName = vendorName;
            this.packQty = packQty;
            this.packsPerCase = packsPerCase;
            this.uomName = uomName;
            this.uomid = uomid;
            this.productCode = productCode;
            this.price = price;
            this.minOrderQty = minOrderQty;
            this.priceType = priceType;
            this.ratio = ratio;
            this.vendorGUID = vendorGUID;
            this.catalogItemCode = catalogItemCode;
            this.taxLevelID = taxLevelID;
            this.taxValue = taxValue;
            this.priceWithVat = priceWithVat;
            this.scanBarcode = scanBarcode;
        }

        static fromJSON(json: { [id: string]: any }): PurchaseItem {
            return new PurchaseItem(
                json.Name,
                json.SupplierName,
                json.VendorName,
                json.PackQty,
                json.PacksPerCase,
                json.UOMName,
                json.UOMID,
                json.ProductCode,
                json.Price,
                json.MinOrderQty,
                json.PriceType,
                json.Ratio,
                json.VendorGUID,
                json.CatalogItemCode,
                json.TaxLevelID,
                json.TaxValue,
                json.PriceWithVat,
                json.ScanBarcode
            );
        }

        public static fromJSONArray(jsonArray: []): PurchaseItem[] {
            var items: PurchaseItem[] = [];
            jsonArray.forEach(json => {
                items.push(PurchaseItem.fromJSON(json));
            });
            return items;
        }


        public toFlatDictionary(): { [id: string]: any } {

            var data = {
                "name": this.name,
                "supplierName": this.supplierName,
                "vendorName": this.vendorName,
                "packQty": this.packQty,
                "packsPerCase": this.packsPerCase,
                "uomName": this.uomName,
                "uomid": this.uomid,
                "productCode": this.productCode,
                "price": this.price,
                "minOrderQty": this.minOrderQty,
                "priceType": this.priceType,
                "ratio": this.ratio,
                "vendorGUID": this.vendorGUID,
                "catalogItemCode": this.catalogItemCode,
                "taxLevelID": this.taxLevelID,
                "taxValue": this.taxValue,
                "priceWithVat": this.priceWithVat,
                "scanBarcode": this.scanBarcode,
            }
            return data;
        }

        public static headers(): string[] {
            var headers = [
                "name",
                "supplierName",
                "vendorName",
                "packQty",
                "packsPerCase",
                "uomName",
                "uomid",
                "productCode",
                "price",
                "minOrderQty",
                "priceType",
                "ratio",
                "vendorGUID",
                "catalogItemCode",
                "taxLevelID",
                "taxValue",
                "priceWithVat",
                "scanBarcode",
            ];
            return headers;
        }

    }
}