namespace Marketman {
    // TODO: IMPLEMENT and Create Request

    export class InventoryItemsResponse {
        isSuccess: boolean;
        errorMessage: string;
        errorCode: string;
        items: InventoryItem[];
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
    }

    export interface PurchaseItem {
        name: string;
        supplierName: string;
        vendorName: string;
        packQty: number | null;
        packsPerCase: number | null;
        uomName: string;
        uomid: number;
        productCode: null | string;
        price: null;
        minOrderQty: number | null;
        priceType: string;
        ratio: number | null;
        vendorGUID: string;
        catalogItemCode: number;
        taxLevelID: number;
        taxValue: number;
        priceWithVat: number;
        scanBarcode: null | string;
    }
}