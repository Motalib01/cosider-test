import { Item } from "./item";

export type Invoice = {
    InvoiceID: string;
    InvoiceDate: string;
    ClientName: string;
    ClientRC: string;
    ClientAddress: string;
    ClientPhone: string;
    ClientBank: string;
    SupplierName: string;
    SupplierRC: string;
    SupplierAddress: string;
    SupplierPhone: string;
    SupplierBank: string;
    Amount: number;
    InvoiceItems: Item[];
};
