import React, { useState, useEffect } from "react";
import { TagsInput } from "react-tag-input-component";

const Tags = ({ defaultSelectedValues = [], setTagValues, placeholderText = '' }) => {
  const [selected, setSelected] = useState(defaultSelectedValues);

  useEffect(() => {
    setSelected(defaultSelectedValues);
  }, [defaultSelectedValues]);

  const handleTagsChange = (tags) => {
    setSelected(tags);
    if (setTagValues) {
      setTagValues(tags);
    }
  };

  return (
    <div className="my-6">
      <h5 className="text-gray-400 pb-2">Add tags</h5>
      <div className="border rounded-md p-2">
      <TagsInput
        value={selected}
        onChange={handleTagsChange}
        placeHolder={placeholderText}
         classNames={{
      input: "text-black", 
      tag: "text-black"
    }}
      />
      </div>
    </div>
  );
};

export default Tags;
