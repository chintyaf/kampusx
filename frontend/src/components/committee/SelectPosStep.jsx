import React from "react";
import api from "@/api/axios";

const SelectPosStep = ({ posList = [], onSelect }) => {
  return (
    <div>
      <h3>Pilih Pos</h3>

      {posList.length === 0 ? (
        <p>Tidak ada pos tersedia</p>
      ) : (
        posList.map((pos) => (
          <button
            key={pos.id}
            onClick={() => onSelect(pos)}
          >
            {pos.name}
          </button>
        ))
      )}
    </div>
  );
};

export default SelectPosStep;