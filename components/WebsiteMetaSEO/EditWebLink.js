import {
  BTN_EDIT,
} from "@/text";
import React, { useEffect, useState } from "react";
import EditModal from "@/components/ManageTestimonials/EditModal";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
const EditWebLink = ({
  pageTitle,
  metaTitleText,
  metaDescriptionText,
  webLink,
  setWebLink,
  category
}) => {

  const [linkImage, setLinkImage] = useState(webLink?.linkImage);
  const [title, setTitle] = useState(webLink?.title);
  const [description, setDescription] = useState(webLink?.description);
   const [ogImage, setOgImage] = useState(webLink?.ogImage)
  const [editWebLink, setEditWebLink] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEdit = () => {
    setOpenModal(true);
    setEditWebLink(true);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  useEffect(() => {
    setTitle(webLink?.title);
    setDescription(webLink?.description);
    setLinkImage(webLink?.linkImage);
     setOgImage(webLink?.ogImage)
  }, [webLink]);

  return (
    <div>
      {/* <div className="flex px-6"></div> */}
      <div className="flex">
        <div className="flex min-w-[34vw] p-2 border border-gray-400 rounded-lg relative">
          {isCollapsed && <p onClick={toggleCollapse} className="text-lg w-[29vw] m-auto">{pageTitle}</p>}
          {!isCollapsed && (
            <div className="w-[15%] lg:w-[22%] 2xl:w-[15%] flex justify-center items-center">
             {linkImage && <Image
                src={linkImage}
                height={50}
                width={50}
                objectFit="cover"
                alt="profile icon"
                className="rounded-full h-24 w-24 cursor-pointer"
              />}
            </div>
          )}
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center">
              <div className="flex-1">
              </div>
              <div className="flex items-center">
                {!isCollapsed && (
                  <span className="mr-4 text-text_color_primary cursor-pointer underline" onClick={handleEdit}>
                    {BTN_EDIT}
                  </span>
                )}
                <div
                  className="cursor-pointer border border-gray-400 rounded-full p-2"
                  onClick={toggleCollapse}
                >
                  {isCollapsed ? <ChevronDown /> : <ChevronUp />}
                </div>
              </div>
            </div>
            {!isCollapsed && (
              <>
                <p className="mb-2 text-lg">{pageTitle}</p>
                <label>{metaTitleText}</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-2 py-2 mb-3 border rounded-lg text-black"
                  disabled={!openModal}
                />
                <label>{metaDescriptionText}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  maxLength={200}
                  className="w-full px-3 py-2 mb-3 border rounded-lg text-black"
                  disabled={!openModal}
                />
              </>
            )}
          </div>
        </div>
      </div>
      {openModal && (
        <EditModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          onClose={handleCloseModal}
          webLink={webLink}
          setWebLink={setWebLink}
          editWebLink={editWebLink}
          pageTitle={pageTitle}
          category={category}
        />
      )}
    </div>
  );
};

export default EditWebLink;