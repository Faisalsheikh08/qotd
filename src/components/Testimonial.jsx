import React from 'react'

const Testimonial = () => {
    return (
        <div className='bg-gray-50 rounded-xl p-4 shadow-sm mb-4 relative flex flex-col items-center pt-12'>
            <div className='absolute -top-12 w-24 h-24 rounded-full object-cover overflow-hidden mx-auto  bg-violet-500 border-4 border-violet-300'>
                <img src="/assets/danish_sir.png" alt="Profile" className='mt-2' />
            </div>

            <p className='leading-6 text-center text-balance mt-2 font-semibold'>
                <span className='text-xl font-bold text-gray-400'>“ </span>Your Turn to Win — 29,700+ Teaching Pariksha Students Already Selected in BPSC TRE 2024!<span className='text-xl font-bold text-gray-400'> ”</span>
            </p>
        </div>
    )
}

export default Testimonial