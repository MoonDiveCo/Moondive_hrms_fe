import Image from "next/image"

const Box =({bgClass,borderClass,title,description,img,alt,maxHeight=220})=>{

    return(
            <article className={` ${bgClass} border-2 ${borderClass} rounded-3xl px-8 pt-8 min-h-[360px] flex flex-col`}>
                  <header className='px-5'>
                    <h3 className="text-2xl font-semibold text-center text-blackText mb-3">
                    {title}
                    </h3>
                    <p className="text-lg text-center text-primaryText font-normal">
                      {description}
                    </p>
                  </header>
        
                  <div className="mt-6 flex-1 flex items-end">
                  
                    <div className="w-full  overflow-hidden  p-4">
                      <Image
                        src={img}
                        alt={alt}
                        className="w-full object-cover rounded-md"
                        style={{ maxHeight: `${maxHeight}` }}
                      />
                    </div>
                  </div>
                </article>
    )
}
export default Box