import Image from 'next/image'
import React from 'react'

const Ads = ({path}) => {
    // console.log(path)
    return (
        <div className='border-0 border-dashed flex items-center justify-center border-gray-300 shadow-lg bg-gray-50 mt-4 rounded-2xl overflow-hidden p-0 text-center text-gray-500 cursor-pointer'>
            {/* <p>{path}</p> */}
            <img src={path} className="w-full rounded-xl" />
        </div>
    )
}

export default Ads