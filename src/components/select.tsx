import React from "react";

type SelectProps = {
  data: {
    name: string;
    onClick: () => void;
    desc: string;
  }[];
};

const Select = ({ data }: SelectProps) => {
  const [info, setInfo] = React.useState("");
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
                }}
              />
            </label>
          </div>
        ))}
      </fieldset>
      <div className="m-2 text-black text-md font-semibold font-serif flex justify-center  p-4">
        {info}
      </div>
    </>
  );
};

export default Select;
