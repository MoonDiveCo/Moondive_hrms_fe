import React from 'react'
import { Triangle } from 'react-loader-spinner'
const Loading = ({width = '80'}) => {
  return (
    <>
      <div className=" flex justify-center h-50 mb-52 mt-20">
        <Triangle
          height="80"
          width={width}
          color="#971c0c"
          ariaLabel="triangle-loading"
          visible={true}
        />
      </div>
    </>
  )
}
export default Loading
