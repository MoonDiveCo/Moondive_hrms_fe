"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";

import defaultImage from "@/public/CMS/default_image.svg";
import edit from "@/public/CMS/Edit.svg";
import del from "@/public/CMS/trash-01.svg";

import {
  BTN_ADD,
  DELETE_REQUEST,
  ENDPOINT_DELETE_TESTIMONIAL,
  TEXT_SMALL_TESTIMONIAL,
  TEXT_TESTIMONIAL,
  TEXT_TESTIMONIAL_CONFIRM,
} from "@/text";

import { formatDate } from "@/utils/utils";
import EditModal from "@/components/ManageTestimonials/EditModal";
import ConfirmationModal from "@/components/ConfirmationModal/ConfirmationModal";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function ManageTestimonials() {
    const [testimonials, setTestimonials] = useState([])
  const [openModal, setOpenModal] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [modData, setModData] = useState({})
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllModerations()
    setTestimonials(modData?.testimonial || [])
  }, [modData])

   const fetchAllModerations = async () => {
    try {
      const allData = await axios.get(`${process.env.NEXT_PUBLIC_MOONDIVE_API}/admin/moderation-data`)
      setModData(allData?.data?.result || {})
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error('Error fetching moderation data:', error)
    }
  }

  const handleEdit = (index) => {
    setIsAddMode(false);
    setEditIndex(index);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setIsAddMode(true);
    setEditIndex(testimonials.length);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(
        `${process.env.NEXT_PUBLIC_MOONDIVE_API}/${ENDPOINT_DELETE_TESTIMONIAL}/${deleteIndex}/${TEXT_SMALL_TESTIMONIAL}`
      );

      setTestimonials(data?.result?.testimonial || []);
      setOpenDeleteModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setDeleteIndex(null);
    }
  };

   if(loading){
    return(
      <div className='flex items-center justify-center h-screen fixed inset-0 bg-black/5 backdrop-blur-sm'>
        <DotLottieReact
          src='https://lottie.host/ae5fb18b-4cf0-4446-800f-111558cf9122/InmwUHkQVs.lottie'
          loop
          autoplay
          style={{ width: 100, height: 100, alignItems: 'center' }} // add this
        />
      </div>
    )
  }

  return (
    <>
    <div className="p-6">
      {/* HEADER */}
      <div className="mb-3 flex items-center justify-between">
        <h4 className=" text-primaryText">{TEXT_TESTIMONIAL}</h4>

        <button
          className="bg-primary text-whiteText px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition"
          onClick={handleAdd}
        >
          <span className="flex item-center text-xs">{BTN_ADD}</span>
        </button>
      </div>

      {/* GRID OF TESTIMONIAL CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        {testimonials?.map((t, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <div className="flex items-start gap-4">
            <div className="w-[50px] h-[50px] relative rounded-full overflow-hidden">
              <Image
                src={t.profileImage || defaultImage.src}
                alt="profile"
                fill
                className="object-cover"
              />
            </div>

              {/* DETAILS */}
              <div className="flex-1">
                <h5 className=" text-primaryText">{t.name}</h5>
                <p className="text-gray-600 text-sm">{t.designation}</p>
                <p className="text-gray-400 text-xs mt-1">{formatDate(t.createdAt)}</p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col gap-3 items-center">

                {/* DELETE BUTTON */}
              <button
                  className="p-2 bg-red-50 rounded-full hover:bg-red-100 transition"
                  onClick={() => {
                    setDeleteIndex(index);
                    setOpenDeleteModal(true);
                  }}
                >
                  <Image src={del} alt="Delete" width={18} height={18} />
                </button>

                {/* EDIT BUTTON */}
                <button
                  className="p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition"
                  onClick={() => handleEdit(index)}
                >
                  <Image src={edit} alt="Edit" width={18} height={18} />
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {openModal && (
        <EditModal
          openModal={openModal}
          setOpenModal={setOpenModal}
          onClose={() => setOpenModal(false)}
          testimonial={testimonials[editIndex]}
          setTestimonials={setTestimonials}
          editIndex={editIndex}
          isAddMode={isAddMode}
        />
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {openDeleteModal && (
        <ConfirmationModal
          open={openDeleteModal}
          onConfirm={handleDelete}
          onCancel={() => setOpenDeleteModal(false)}
          title={TEXT_TESTIMONIAL_CONFIRM}
          button1="Yes, Delete"
          button2="Cancel"
        />
      )}
      </div>
    </>
  );
}
