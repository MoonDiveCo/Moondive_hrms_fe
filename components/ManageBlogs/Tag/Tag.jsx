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
  <label className="text-gray-500 pb-2">Add Tags</label>

  <TagsInput
    value={selected}
    onChange={handleTagsChange}
    placeHolder="Add tags..."
    classNames={{
      tagInputContainer:
        "border border-gray-300 focus:border-primary rounded-full px-3 py-2 flex flex-wrap gap-2 bg-white",
      input: "text-black outline-none",
      tag:
        "bg-primary text-blackText px-2 py-1 rounded-full text-sm font-medium",
    }}
  />
</div>

  );
};

export default Tags;
