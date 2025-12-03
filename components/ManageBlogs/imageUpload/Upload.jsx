import React, { useState } from 'react'
import Image from 'next/image'
// import previewImage from '@/public/assets/icons/preview.svg'
// import faTrash from '@/public/assets/icons/thrash.svg'
import { toast } from 'react-toastify'
import Styles from './background.module.css'
import ImagePreviewModal from './ImagePreviewModal'
// import Loading from './Loading'
import { Eye, Trash2 } from 'lucide-react'

const ImageUploader = ({
  onFileSelect,
  photoURLs = [],
  deletePhoto,
  onSetCover,
  coverImageUrl,
  handleImageNameChange,
  loading,
  icon,
  Text,
  key,
  Heading,
  textColor = 'secondary',
  textSize = '[0.875rem]',
  textAlign = 'start',
  width = '120px',
  buttonLabel = 'Attach Photos',
  buttonColor = '#0168A2',
  onlyButton,
  upload,
  setUpload,
}) => {
  const [previewImages, setPreviewImages] = useState([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const openPreview = (index) => {
    setCurrentPreviewIndex(index)
    setIsPreviewOpen(true)
  }
  const closePreview = () => {
    setIsPreviewOpen(false)
  }

  const showNextImage = () => {
    setCurrentPreviewIndex((currentPreviewIndex + 1) % photoURLs.length)
  }
  const showPreviousImage = () => {
    setCurrentPreviewIndex(
      (currentPreviewIndex - 1 + photoURLs.length) % photoURLs.length
    )
  }
  const handleSetAsCover = (imageUrl) => {
    onSetCover(imageUrl)
  }
  const inlineStyle = {
    backgroundColor: buttonColor,
    width: width,
    height: '33px',
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'rgb(255, 255, 255)',
    padding: '7px 7px',
    borderRadius: '0.25rem',
    cursor: 'default',
  }

  const handleChange = (e) => {
    const newFiles = Array.from(e.target.files)
    if (newFiles.length + photoURLs.length < 0) {
      toast.error('Please upload at least 1 image')
      return
    }
    const newPreviewImages = newFiles.map((file) => URL.createObjectURL(file))
    setPreviewImages([...previewImages, ...newPreviewImages])
    onFileSelect(newFiles)
    if (newFiles && setUpload != undefined) {
      setUpload(true)
    }
  }
  return (
    <div className={onlyButton && 'flex'}>
      {!onlyButton ? (
        <div
          className={`flex items-center justify-center gap-4 bg-nearbySelectedBackground border-[1px] border-primary  rounded-3xl md:w-[600px] p-4 max-md:p-2 max-md:px-2  mb-3 ${Styles.dashed}`}
        >
          <div className={` gap-4 p-4 ${Styles.parent}`}>
            <div className="max-md:flex max-md:justify-between max-md:items-center max-md:gap-4">
              {icon}
              <div className="w-[100px] h-8 px-2 py-2 bg-nearbySelectedBackground rounded justify-center items-start lg:ml-9 inline-flex md:hidden">
                <div className=" text-center text-primary  font-bold leading-normal text-[0.625rem] max-md:mx-auto">
                  Max size
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 justify-start ">
              <div className="flex justify-between gap-4 ">
                <div className="text-left">
                  <h4 className=" font-bold text-primary mb-2">{Heading}</h4>
                  <p
                    className={`h-[50px] break-keep text-${textColor} text-${textSize}  text-${textAlign}  font-normal leading-[128%] tracking-[0.14px]`}
                  >
                    {Text}
                  </p>
                </div>
                <div className=" w-[12.2rem] h-8 px-2 py-2 md:px-0 bg-nearbySelectedBackground rounded justify-center items-start gap-2 inline-flex max-md:hidden">
                  <div className=" text-center  text-primary  font-bold  leading-normal text-[0.625rem]">
                    Max size
                  </div>
                </div>
              </div>
              <label style={inlineStyle} className="max-md:mt-4 bg-red-600">
                {buttonLabel}
                <input
                  type="file"
                  className="hidden"
                  key={key}
                  onChange={handleChange}
                  multiple
                />
              </label>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="file"
            id="fileInput"
            key={key}
            onChange={handleChange}
            className="h-auto"
          />
        </div>
      )}

      <div
        className={`grid md:grid-cols-4 justify-center xl:grid-cols-5 xl:gap-7 2xl:grid-cols-5 max-md:grid-cols-2 `}
      >
        {/* {loading && (
          <div className="loader-container">
            <Loading />
          </div>
        )} */}
        {photoURLs?.map((photoURL, index) => (
          <div key={`uploaded_${index}`} className="space-y-2">
            <div
              style={{
                backgroundImage: `url(${photoURL?.url || photoURL})`,
                backgroundSize: 'contain',
              }}
              className={`relative ${onlyButton ? 'ml-9 w-20 h-20' : 'w-36 h-36'} rounded-lg overflow-hidden ${index === 0 && 'ring-2 ring-primary'}`}
            >
              <div className=" flex justify-between">
                <button
                  onClick={() => openPreview(index)} // Open preview modal
                  className={`px-0.5 ${onlyButton ? 'w-5 h-5' : 'w-6 h-6'}  bg-black bg-opacity-60 rounded-full border backdrop-blur-sm`}
                >
                  <Eye height={14} width={14} />
                </button>
                <button
                  onClick={() => deletePhoto(index, photoURL.url, setUpload)}
                  className={`px-0.5 ${onlyButton ? 'w-5 h-5' : 'w-6 h-6'}  bg-black bg-opacity-60 rounded-full border backdrop-blur-sm`}
                >
                  <Trash2 height={14} width={14} />
                </button>
              </div>
            </div>
            {!onlyButton && (
              <div className=" bottom-0 left-0 w-fit px-0.5 bg-white bg-opacity-75">
                <select
                  value={photoURL.name}
                  onChange={(e) => handleImageNameChange(index, e.target.value)}
                  className=" mt-1 block w-fit rounded-sm border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-[0.875rem] custom-scrollbar"
                >
                  {/* {roomOptions.map((option, idx) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))} */}
                </select>
                <div className="flex items-center gap-1 mt-1  justify-center">
                  <input
                    id="cover-checkbox"
                    type="checkbox"
                    checked={
                      !photoURL.url === coverImageUrl ? true : index === 0
                    }
                    onChange={() => handleSetAsCover(photoURL.url)}
                    className="w-4 h-3 bg-cyan-800"
                  />
                  <label
                    htmlFor="cover-checkbox"
                    className="text-gray-700 dark:text-gray-300 text-[0.875rem]"
                  >
                    Set as Cover
                  </label>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        images={photoURLs}
        selectedIndex={currentPreviewIndex}
        onClose={closePreview}
        onNext={showNextImage}
        onPrevious={showPreviousImage}
      />
    </div>
  )
}

export default ImageUploader
