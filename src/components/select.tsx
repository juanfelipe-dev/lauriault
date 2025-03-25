import React from "react";

type SelectProps = {
  data: {
    name: string;
    onClick: () => void;
    desc: string;
    legend: string;
    label: string[];
  }[];
};

const Select = ({ data }: SelectProps) => {
  const [info, setInfo] = React.useState("");
  const [legend, setLegend] = React.useState("");
  const [label, setLabel] = React.useState(["", ""]);
  return (
    <>
      <fieldset className="grid grid-cols-7 gap-4 m-2">
        {data.map((item) => (
          <div key={item.name}>
            <label
              htmlFor={item.name}
              className="block cursor-pointer rounded-lg border border-gray-100 bg-white p-4 text-sm font-medium shadow-xs hover:border-gray-200 hover:opacity-100 opacity-50"
            >
              <div className="min-h-12 flex items-center">
                <p className="text-gray-700">{item.name}</p>
              </div>

              <input
                type="radio"
                value={item.name}
                id={item.name}
                className="sr-only"
                onClick={() => {
                  item.onClick();
                  setInfo(item.desc);
                  setLegend(item.legend);
                  setLabel(item.label);
                }}
              />
            </label>
          </div>
        ))}
      </fieldset>
      {info && (
        <div className="m-2 text-black text-md font-semibold font-serif flex justify-between p-4">
          <p>{info}</p>
          <div>
            <div className={`min-w-72 h-4 rounded-md ${legend}`} />
            <div className="flex justify-between m-1">
              <p>{label[0]}</p> <p>{label[1]}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Select;
