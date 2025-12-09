import React from 'react';
import Styles from './background.module.css'
import Image from 'next/image';
import dynamic from 'next/dynamic';
const ImagePreviewModal = ({ isOpen, images, selectedIndex, onClose, onNext, onPrevious, onSelect }) => {
  if (!isOpen || !images.length) return null;
  const selectedImage = images[selectedIndex];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[999999]">

      <div className=" w-full h-[100%] py-4 bg-black bg-opacity-40 backdrop-blur-2xl items-center rounded-lg ">
        <button onClick={onPrevious} className="absolute left-4 md:left-10 top-1/2 transform -translate-y-1/2 text-2xl text-white z-20">
          &#10094;
        </button>
        <div className='w-full h-[80%] flex justify-center items-center overflow-hidden'>
          <div className='w-[60%] h-[100%] relative '>
        {selectedImage.url.toLowerCase().endsWith(".pdf") ? (
            <iframe
            src={`https://docs.google.com/gview?embedded=true&url=${selectedImage.url}`}
            width="100%"
            height="600">
            </iframe>
        ) : (
            <Image
              src={selectedImage.url}
              alt="preview"
              fill
              className="object-contain rounded-lg"
            />
        )}
          </div>
        </div>
        <button onClick={onNext} className="absolute right-4 md:right-10 top-1/2 transform -translate-y-1/2 text-2xl text-white  z-20">
          &#10095;
        </button>
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-white z-20">
          &#10005;
        </button>
        {selectedImage.url.toLowerCase().endsWith(".pdf") ?<div className={`bottom-2 w-full h-fit mt-2 flex justify-center items-center px-4 py-2 overflow-x-auto overflow-y-hidden ${Styles.customScroll}`}>
          <div className="flex gap-[19px]">
            {images.map((image, index) => (
              <button
                key={index}
                className={`flex-shrink-0 h-24 w-24 md:w-32 rounded-[10px] border-2 ${index === selectedIndex ? 'border-blue-500 scale-110 ' : 'border-transparent'}`}
                onClick={() => onSelect(index)}
              >
                <Image
                  src={image?.url}
                  alt={`Thumbnail ${selectedIndex}`}
                  className="object-cover rounded-lg"
                  height={100}
                  width={100}
                />
              </button>
            ))}
          </div>
        </div>: null}
      </div>
    </div>
  );
};

export default ImagePreviewModal;
