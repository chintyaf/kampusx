import React from "react";
import { MoreHorizontal } from "lucide-react"; // Menggunakan lucide-react untuk ikon titik tiga

const FormPlaceholder = () => {
    return (
        <div className="flex items-center justify-center min-h-[300px] w-full p-6">
            <div
                className="p-5 w-full max-w-4xl text-center"
                style={{ border: "1.5px #d2d7df dashed", backgroundColor: "#ffffff61" }}
            >
                {/* Ikon Bulat dengan Titik Tiga */}
                {/* <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center mb-6 text-gray-400">
                    <MoreHorizontal size={20} />
                </div> */}

                {/* Teks Utama */}
                <h2 className="fs-5 font-medium text-gray-600">
                    Pilih tipe kehadiran di atas untuk melanjutkan
                </h2>
            </div>
        </div>
    );
};

export default FormPlaceholder;
