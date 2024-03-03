import { useEffect, useState } from "react";
import { Invoice } from "./types/invoice";
import DataGrid, { Column } from "react-data-grid";
import "react-data-grid/lib/styles.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

function ModalComponent({
    isOpen,
    setIsOpen,
    invoice,
}: {
    isOpen: boolean;
    setIsOpen: (b: boolean) => void;
    invoice?: Invoice;
}) {
    const closeModal = () => setIsOpen(false);

    return (
        isOpen && (
            <div
                aria-label="backdrop"
                className="w-full justify-center py-8 h-[74rem] absolute inset-0 bg-[rgba(0,0,0,0.43)] z-20"
                onClick={closeModal}
            >
                <button
                    className="absolute top-8 left-3/4 z-40 py-2 px-4 bg-white rounded-lg shadow-sm"
                    onClick={printDocument}
                >
                    Print
                </button>
                <dialog
                    className="w-[49.61rem] h-[70.16rem] mx-auto z-30 shadow-sm rounded-lg"
                    open
                    id={"pdfDialog"}
                >
                    <div className="flex flex-col py-16 px-24 justify-start items-center gap-4">
                        <h3 className="text-2xl font-black">Facture № {invoice?.InvoiceID}</h3>
                        <div className="flex gap-16 justify-between w-full">
                            <div className="flex-1"></div>
                            <h4 className="text-lg flex-1 text-left font-light">
                                Date de facture: {invoice?.InvoiceDate}
                            </h4>
                        </div>
                        <div className="flex mt-16 gap-16 justify-between w-full">
                            <div className="flex flex-1 flex-col">
                                <h4 className="text-lg font-light py-2">Fournisseur</h4>
                                <div className="w-full border-b-4"></div>
                                <h3 className="font-black mt-4">{invoice?.SupplierName}</h3>
                                <h3 className="">{invoice?.SupplierAddress}</h3>
                                <h3 className="">{invoice?.SupplierPhone}</h3>
                            </div>
                            <div className="flex flex-1 flex-col">
                                <h4 className="text-lg font-light py-2">Client</h4>
                                <div className="w-full border-b-4"></div>
                                <h3 className="font-black mt-4">{invoice?.ClientName}</h3>
                                <h3 className="">{invoice?.ClientAddress}</h3>
                                <h3 className="">{invoice?.ClientPhone}</h3>
                            </div>
                        </div>
                        <table className="w-full">
                            <thead className="bg-orange-300">
                                <tr>
                                    <th>N°</th>
                                    <th>Libelle</th>
                                    <th>Quantite</th>
                                    <th>Prix</th>
                                    <th>HT</th>
                                    <th>TTC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice?.InvoiceItems.map((item, index) => {
                                    return (
                                        <tr>
                                            <th>{index}</th>
                                            <th>{item.ItemLibelle}</th>
                                            <th>{item.ItemQuantity}</th>
                                            <th>{item.ItemPrice}</th>
                                            <th>{item.ItemPrice * item.ItemQuantity}</th>
                                            <th>
                                                {(item.ItemPrice + item.ItemTax) *
                                                    item.ItemQuantity}
                                            </th>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="flex mt-16 gap-16 justify-between w-full">
                            <div className="flex-1"></div>
                            <table className="w-full flex-1">
                                <tbody>
                                    <tr>
                                        <th>Total</th>
                                        <th>
                                            {invoice?.InvoiceItems.reduce(
                                                (previous, current) => {
                                                    return previous + current.ItemPrice;
                                                },
                                                0,
                                            )}
                                        </th>
                                    </tr>
                                    <tr>
                                        <th>TVA</th>
                                        <th>
                                            {invoice?.InvoiceItems.reduce(
                                                (previous, current) => {
                                                    return previous + current.ItemTax;
                                                },
                                                0,
                                            )}
                                        </th>
                                    </tr>{" "}
                                    <tr>
                                        <th>Total TTC</th>
                                        <th>{invoice?.Amount}</th>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex mt-16 gap-16 justify-between w-full">
                            <div className="flex-1"></div>
                            <h4 className="font-medium text-center flex-1">La Signature</h4>
                        </div>
                    </div>
                </dialog>
            </div>
        )
    );
}

const printDocument = () => {
    const input = document.getElementById("pdfDialog");
    if (input)
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4", false);
            pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
            pdf.save("download.pdf");
        });
};

async function getInvoices(setInvoices: (e: any) => void) {
    try {
        const result = (await fetch("https://elhoussam.github.io/invoicesapi/db.json").then(
            (response) => response.json(),
        )) as Invoice[];
        setInvoices(result);
    } catch {
        alert("An error occured while fetching...");
        return [];
    }
}

function App() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [currentInvoice, setCurrentInvoice] = useState<Invoice | undefined>(undefined);
    useEffect(() => {
        getInvoices(setInvoices);
    }, []);
    const columns: Column<any, any>[] = [
        { key: "InvoiceID", name: "Facture ID", minWidth: 100 },
        { key: "InvoiceDate", name: "Facture Date", minWidth: 100 },
        { key: "ClientName", name: "Client Nom", minWidth: 100 },
        { key: "SupplierName", name: "Fournisseur Nom", minWidth: 100 },
        { key: "Amount", name: "Montant TTC", minWidth: 100 },
    ];

    let rows = invoices.map((i) => {
        return {
            ...i,
            Amount: i.InvoiceItems.reduce((p, c) => {
                return p + c.ItemQuantity * (c.ItemPrice + c.ItemTax);
            }, 0),
        };
    });

    if (inputValue !== "") {
        rows = rows.filter((invoice) => {
            for (const item of invoice.InvoiceItems) {
                if (
                    inputValue &&
                    item.ItemLibelle.toLowerCase().includes(inputValue.toLowerCase())
                )
                    return true;
            }
            return false;
        });
    }
    return (
        <>
            <main className="p-4">
                <div className="flex w-full justify-between items-center">
                    <h1 className="text-3xl font-medium">Invoices</h1>
                    <input
                        onChange={(e) => {
                            setInputValue(e.currentTarget.value);
                        }}
                        type="search"
                        placeholder="Recherche produit"
                        className="px-2"
                    />
                </div>
                <button onClick={() => setIsOpen(true)}>Open Modal</button>
                <ModalComponent
                    isOpen={isOpen}
                    invoice={currentInvoice}
                    setIsOpen={setIsOpen}
                />
                <DataGrid
                    style={{ width: "100%", height: "100%" }}
                    className="rdg-light"
                    rows={rows}
                    onCellClick={(s) => {
                        setCurrentInvoice(s.row);
                        setIsOpen(true);
                    }}
                    columns={columns}
                />
            </main>
            <footer></footer>
        </>
    );
}

export default App;
